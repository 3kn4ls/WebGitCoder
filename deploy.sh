#!/bin/bash

# Script de despliegue de WebGitCoder en k3s Raspberry Pi 5
# Autor: WebGitCoder Team
# Versión: 1.0.0

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
APP_NAME="webgitcoder"
NAMESPACE="webgitcoder"
IMAGE_NAME="localhost:5000/webgitcoder"
IMAGE_TAG="${IMAGE_TAG:-latest}"
K8S_DIR="./k8s"
REGISTRY_PORT="${REGISTRY_PORT:-5000}"

# Funciones de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar prerequisitos
check_prerequisites() {
    log_info "Verificando prerequisitos..."

    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi

    # Verificar kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl no está instalado"
        exit 1
    fi

    # Verificar conexión a k3s
    if ! kubectl cluster-info &> /dev/null; then
        log_error "No se puede conectar al clúster k3s"
        exit 1
    fi

    log_success "Todos los prerequisitos están instalados"
}

# Función para configurar registry local
setup_local_registry() {
    log_info "Verificando registry local en puerto ${REGISTRY_PORT}..."

    # Verificar si el registry ya está corriendo
    if docker ps | grep -q "registry:2"; then
        log_success "Registry local ya está corriendo"
    else
        log_info "Iniciando registry local..."
        docker run -d \
            --restart=always \
            --name registry \
            -p ${REGISTRY_PORT}:5000 \
            registry:2

        # Esperar a que el registry esté listo
        sleep 3
        log_success "Registry local iniciado en localhost:${REGISTRY_PORT}"
    fi
}

# Función para construir la imagen Docker
build_image() {
    log_info "Construyendo imagen Docker para ARM64..."

    # Build de la imagen
    docker build \
        --platform linux/arm64 \
        -t ${IMAGE_NAME}:${IMAGE_TAG} \
        -t ${IMAGE_NAME}:$(git rev-parse --short HEAD 2>/dev/null || echo "latest") \
        .

    log_success "Imagen construida: ${IMAGE_NAME}:${IMAGE_TAG}"
}

# Función para subir imagen al registry
push_image() {
    log_info "Subiendo imagen al registry local..."

    docker push ${IMAGE_NAME}:${IMAGE_TAG}

    log_success "Imagen subida al registry"
}

# Función para crear namespace
create_namespace() {
    log_info "Creando namespace ${NAMESPACE}..."

    kubectl apply -f ${K8S_DIR}/namespace.yaml

    log_success "Namespace creado/actualizado"
}

# Función para aplicar ConfigMap
apply_configmap() {
    log_info "Aplicando ConfigMap..."

    if [ -f "${K8S_DIR}/configmap.yaml" ]; then
        kubectl apply -f ${K8S_DIR}/configmap.yaml
        log_success "ConfigMap aplicado"
    else
        log_warning "ConfigMap no encontrado, omitiendo..."
    fi
}

# Función para desplegar la aplicación
deploy_app() {
    log_info "Desplegando aplicación..."

    # Aplicar deployment
    kubectl apply -f ${K8S_DIR}/deployment.yaml

    # Aplicar service
    kubectl apply -f ${K8S_DIR}/service.yaml

    # Aplicar ingress
    kubectl apply -f ${K8S_DIR}/ingress.yaml

    log_success "Manifiestos aplicados"
}

# Función para aplicar HPA (opcional)
apply_hpa() {
    log_info "Aplicando HorizontalPodAutoscaler..."

    if [ -f "${K8S_DIR}/hpa.yaml" ]; then
        kubectl apply -f ${K8S_DIR}/hpa.yaml
        log_success "HPA aplicado"
    else
        log_warning "HPA no encontrado, omitiendo..."
    fi
}

# Función para esperar a que el deployment esté listo
wait_for_deployment() {
    log_info "Esperando a que el deployment esté listo..."

    kubectl wait --for=condition=available \
        --timeout=300s \
        deployment/${APP_NAME} \
        -n ${NAMESPACE}

    log_success "Deployment está listo"
}

# Función para mostrar el status
show_status() {
    log_info "Estado del despliegue:"
    echo ""

    kubectl get pods -n ${NAMESPACE}
    echo ""
    kubectl get svc -n ${NAMESPACE}
    echo ""
    kubectl get ingress -n ${NAMESPACE}
    echo ""

    log_success "Despliegue completado exitosamente!"
    echo ""

    # Obtener la IP del clúster
    CLUSTER_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')

    log_info "Accede a la aplicación en:"
    echo -e "  ${GREEN}http://webgitcoder.local${NC}"
    echo -e "  ${GREEN}http://${CLUSTER_IP}${NC} (si no tienes DNS configurado)"
    echo ""
    log_info "Agrega esta línea a tu /etc/hosts si es necesario:"
    echo -e "  ${YELLOW}${CLUSTER_IP} webgitcoder.local${NC}"
}

# Función para rollback
rollback() {
    log_warning "Realizando rollback..."

    kubectl rollout undo deployment/${APP_NAME} -n ${NAMESPACE}

    log_success "Rollback completado"
}

# Función para limpiar el despliegue
cleanup() {
    log_warning "Limpiando despliegue..."

    kubectl delete -f ${K8S_DIR}/ingress.yaml || true
    kubectl delete -f ${K8S_DIR}/service.yaml || true
    kubectl delete -f ${K8S_DIR}/deployment.yaml || true
    kubectl delete -f ${K8S_DIR}/configmap.yaml || true
    kubectl delete -f ${K8S_DIR}/hpa.yaml || true
    kubectl delete namespace ${NAMESPACE} || true

    log_success "Limpieza completada"
}

# Función para ver logs
show_logs() {
    log_info "Mostrando logs de los pods..."

    kubectl logs -n ${NAMESPACE} -l app=${APP_NAME} --tail=100 -f
}

# Función de ayuda
show_help() {
    cat << EOF
Script de despliegue de WebGitCoder en k3s

Uso: $0 [COMANDO]

Comandos:
    deploy          Desplegar la aplicación completa (por defecto)
    build           Solo construir la imagen Docker
    push            Solo subir la imagen al registry
    rollback        Revertir al deployment anterior
    cleanup         Eliminar todos los recursos
    logs            Mostrar logs de la aplicación
    status          Mostrar el estado del despliegue
    help            Mostrar esta ayuda

Variables de entorno:
    IMAGE_TAG       Tag de la imagen (default: latest)
    REGISTRY_PORT   Puerto del registry local (default: 5000)

Ejemplos:
    $0                      # Despliegue completo
    $0 deploy               # Despliegue completo
    $0 build                # Solo construir imagen
    IMAGE_TAG=v1.0.0 $0     # Desplegar con tag específico
    $0 rollback             # Revertir deployment
    $0 cleanup              # Limpiar todos los recursos

EOF
}

# Función principal de despliegue
main_deploy() {
    log_info "Iniciando despliegue de ${APP_NAME}..."
    echo ""

    check_prerequisites
    setup_local_registry
    build_image
    push_image
    create_namespace
    apply_configmap
    deploy_app
    apply_hpa
    wait_for_deployment
    show_status
}

# Procesar argumentos
case "${1:-deploy}" in
    deploy)
        main_deploy
        ;;
    build)
        check_prerequisites
        build_image
        ;;
    push)
        check_prerequisites
        setup_local_registry
        push_image
        ;;
    rollback)
        rollback
        ;;
    cleanup)
        cleanup
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Comando desconocido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
