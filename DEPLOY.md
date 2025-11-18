# 🚀 Guía de Despliegue en k3s Raspberry Pi 5

Esta guía te ayudará a desplegar **WebGitCoder** en un clúster k3s ejecutándose en Raspberry Pi 5.

## 📋 Prerequisitos

### Hardware
- **Raspberry Pi 5** (se recomienda 4GB o 8GB de RAM)
- Tarjeta SD/SSD con al menos 32GB
- Conexión a internet

### Software
- **k3s** instalado y ejecutándose
- **Docker** instalado
- **kubectl** configurado para acceder al clúster
- **git** para clonar el repositorio

## 🛠️ Instalación de k3s en Raspberry Pi 5

Si aún no tienes k3s instalado:

```bash
# Instalar k3s
curl -sfL https://get.k3s.io | sh -

# Verificar instalación
sudo k3s kubectl get nodes

# Configurar kubectl (como usuario no-root)
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $USER:$USER ~/.kube/config
export KUBECONFIG=~/.kube/config

# Verificar
kubectl get nodes
```

## 📦 Estructura de Archivos

```
WebGitCoder/
├── deploy.sh                # Script principal de despliegue
├── Dockerfile               # Imagen Docker multi-stage
├── nginx.conf              # Configuración nginx
├── .dockerignore           # Archivos a ignorar en build
└── k8s/                    # Manifiestos de Kubernetes
    ├── namespace.yaml      # Namespace webgitcoder
    ├── configmap.yaml      # Configuraciones
    ├── deployment.yaml     # Deployment con 2 réplicas
    ├── service.yaml        # Service ClusterIP
    ├── ingress.yaml        # Ingress con Traefik
    └── hpa.yaml           # HorizontalPodAutoscaler
```

## 🚀 Despliegue Rápido

### Opción 1: Despliegue Completo Automatizado

```bash
# Clonar el repositorio (si aún no lo has hecho)
git clone https://github.com/usuario/WebGitCoder.git
cd WebGitCoder

# Ejecutar despliegue completo
./deploy.sh
```

El script realizará automáticamente:
1. ✅ Verificación de prerequisitos
2. 🐳 Configuración de registry local
3. 🔨 Build de la imagen Docker ARM64
4. 📤 Push al registry local
5. 📦 Creación de namespace
6. ⚙️ Aplicación de manifiestos
7. ⏳ Espera hasta que esté listo
8. 📊 Muestra el estado final

### Opción 2: Despliegue Paso a Paso

```bash
# 1. Solo construir la imagen
./deploy.sh build

# 2. Subir al registry
./deploy.sh push

# 3. Desplegar en k8s
./deploy.sh deploy
```

## 🔧 Comandos del Script deploy.sh

```bash
# Despliegue completo
./deploy.sh deploy

# Solo build de imagen
./deploy.sh build

# Solo push al registry
./deploy.sh push

# Ver estado
./deploy.sh status

# Ver logs en tiempo real
./deploy.sh logs

# Rollback a versión anterior
./deploy.sh rollback

# Limpiar todo (CUIDADO: elimina todos los recursos)
./deploy.sh cleanup

# Ayuda
./deploy.sh help
```

## 🏷️ Tags de Versión

Puedes desplegar con tags específicos:

```bash
# Desplegar versión específica
IMAGE_TAG=v1.0.0 ./deploy.sh

# Desplegar usando commit hash
IMAGE_TAG=$(git rev-parse --short HEAD) ./deploy.sh
```

## 🌐 Acceso a la Aplicación

La aplicación está configurada para ser accesible en:

**https://northr3nd.duckdns.org/webgitcoder**

### Requisitos Previos

1. **Certificado SSL**: Asegúrate de que el certificado SSL esté instalado
2. **Secret de Kubernetes**: El secret `northr3nd-tls` debe existir en el namespace `webgitcoder`

### Verificar el Certificado SSL

```bash
# Verificar que el secret existe
kubectl get secret northr3nd-tls -n webgitcoder

# Si no existe, créalo desde tus archivos de certificado
kubectl create secret tls northr3nd-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  -n webgitcoder
```

### Acceder a la Aplicación

Abre tu navegador y visita:
- **https://northr3nd.duckdns.org/webgitcoder**

## 🔍 Verificación del Despliegue

```bash
# Ver todos los pods
kubectl get pods -n webgitcoder

# Ver servicios
kubectl get svc -n webgitcoder

# Ver ingress
kubectl get ingress -n webgitcoder

# Descripción del deployment
kubectl describe deployment webgitcoder -n webgitcoder

# Ver logs de un pod específico
kubectl logs -n webgitcoder <nombre-del-pod>

# Ver logs de todos los pods
kubectl logs -n webgitcoder -l app=webgitcoder --tail=100
```

## 📊 Monitoreo

### Ver Recursos

```bash
# CPU y memoria de los pods
kubectl top pods -n webgitcoder

# Eventos
kubectl get events -n webgitcoder --sort-by='.lastTimestamp'
```

### Ver Logs en Tiempo Real

```bash
./deploy.sh logs

# O manualmente
kubectl logs -n webgitcoder -l app=webgitcoder -f
```

## 🔄 Actualizar la Aplicación

### Método 1: Script Automático

```bash
# Pull de cambios
git pull

# Re-desplegar
./deploy.sh
```

### Método 2: Manual

```bash
# Build nueva imagen
docker build -t localhost:5000/webgitcoder:latest .

# Push al registry
docker push localhost:5000/webgitcoder:latest

# Reiniciar pods para usar la nueva imagen
kubectl rollout restart deployment/webgitcoder -n webgitcoder

# Verificar estado
kubectl rollout status deployment/webgitcoder -n webgitcoder
```

## ⏮️ Rollback

Si algo sale mal:

```bash
# Rollback automático
./deploy.sh rollback

# O manualmente
kubectl rollout undo deployment/webgitcoder -n webgitcoder

# Ver historial de rollouts
kubectl rollout history deployment/webgitcoder -n webgitcoder
```

## 🔐 Configuración HTTPS

La aplicación ya está configurada para usar HTTPS con el dominio `northr3nd.duckdns.org`.

### Secret SSL Requerido

El Ingress espera un secret TLS llamado `northr3nd-tls` en el namespace `webgitcoder`.

**Si el secret ya existe globalmente**, cópialo al namespace:

```bash
# Copiar secret de otro namespace
kubectl get secret northr3nd-tls -n <namespace-origen> -o yaml | \
  sed 's/namespace: .*/namespace: webgitcoder/' | \
  kubectl apply -f -
```

**Si necesitas crear el secret desde archivos de certificado**:

```bash
kubectl create secret tls northr3nd-tls \
  --cert=/path/to/tls.crt \
  --key=/path/to/tls.key \
  -n webgitcoder
```

**Si usas cert-manager**, puedes crear un Certificate:

```yaml
# certificate.yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: northr3nd-tls
  namespace: webgitcoder
spec:
  secretName: northr3nd-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - northr3nd.duckdns.org
```

```bash
kubectl apply -f certificate.yaml
```

## 🧹 Limpieza Completa

Para eliminar completamente la aplicación:

```bash
# Usando el script
./deploy.sh cleanup

# O manualmente
kubectl delete namespace webgitcoder

# Detener registry local (opcional)
docker stop registry
docker rm registry
```

## 🐛 Troubleshooting

### Problema: Los pods no inician

```bash
# Ver eventos
kubectl get events -n webgitcoder --sort-by='.lastTimestamp'

# Describir pod
kubectl describe pod <pod-name> -n webgitcoder

# Ver logs
kubectl logs <pod-name> -n webgitcoder
```

### Problema: No puedo acceder a la aplicación

```bash
# Verificar ingress
kubectl get ingress -n webgitcoder

# Verificar service
kubectl get svc -n webgitcoder

# Port-forward temporal para debug
kubectl port-forward -n webgitcoder svc/webgitcoder 8080:80
# Luego accede a http://localhost:8080
```

### Problema: Registry no funciona

```bash
# Reiniciar registry
docker restart registry

# O recrearlo
docker stop registry
docker rm registry
./deploy.sh  # El script creará el registry automáticamente
```

### Problema: Imagen no se actualiza

```bash
# Forzar pull de imagen nueva
kubectl rollout restart deployment/webgitcoder -n webgitcoder

# O eliminar y recrear pods
kubectl delete pods -n webgitcoder -l app=webgitcoder
```

## 📈 Escalado

### Escalado Manual

```bash
# Escalar a 3 réplicas
kubectl scale deployment/webgitcoder --replicas=3 -n webgitcoder
```

### Escalado Automático (HPA)

El HPA ya está configurado en `k8s/hpa.yaml`:
- Mínimo: 2 réplicas
- Máximo: 5 réplicas
- Basado en CPU (70%) y memoria (80%)

```bash
# Ver estado del HPA
kubectl get hpa -n webgitcoder

# Describir HPA
kubectl describe hpa webgitcoder -n webgitcoder
```

## 🔧 Configuración Avanzada

### Cambiar el hostname

Edita `k8s/ingress.yaml`:

```yaml
spec:
  rules:
  - host: tu-dominio.com  # Cambia esto
```

### Ajustar recursos

Edita `k8s/deployment.yaml`:

```yaml
resources:
  requests:
    memory: "256Mi"  # Ajusta según necesites
    cpu: "200m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

### Variables de entorno

Edita `k8s/configmap.yaml` y añade tus variables.

## 📝 Notas Importantes

1. **Registry Local**: Por defecto usa un registry local en `localhost:5000`
2. **Arquitectura**: Las imágenes se construyen para ARM64 (Raspberry Pi)
3. **Recursos**: Configurado para usar recursos mínimos (128Mi-512Mi RAM)
4. **Réplicas**: Por defecto 2 réplicas para alta disponibilidad
5. **Traefik**: k3s usa Traefik como ingress controller por defecto

## 🤝 Soporte

Si encuentras problemas:

1. Revisa los logs: `./deploy.sh logs`
2. Verifica el estado: `./deploy.sh status`
3. Consulta la sección de Troubleshooting
4. Abre un issue en GitHub

## 📚 Referencias

- [k3s Documentation](https://docs.k3s.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)

---

**¡Feliz despliegue! 🎉**
