# Makefile para WebGitCoder
.PHONY: help build push deploy rollback cleanup logs status install dev

# Configuración
IMAGE_NAME=localhost:5000/webgitcoder
IMAGE_TAG?=latest
NAMESPACE=webgitcoder

help: ## Mostrar esta ayuda
	@echo "WebGitCoder - Comandos disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

install: ## Instalar dependencias npm
	npm install

dev: ## Iniciar servidor de desarrollo
	npm start

build-local: ## Build local para desarrollo
	npm run build

build: ## Build de imagen Docker
	./deploy.sh build

push: ## Push de imagen al registry
	./deploy.sh push

deploy: ## Desplegar en k3s
	./deploy.sh deploy

rollback: ## Rollback a versión anterior
	./deploy.sh rollback

cleanup: ## Limpiar recursos de k8s
	./deploy.sh cleanup

logs: ## Ver logs de la aplicación
	./deploy.sh logs

status: ## Ver estado del despliegue
	kubectl get all -n $(NAMESPACE)

pods: ## Ver pods
	kubectl get pods -n $(NAMESPACE)

describe: ## Describir deployment
	kubectl describe deployment webgitcoder -n $(NAMESPACE)

shell: ## Abrir shell en un pod
	kubectl exec -it -n $(NAMESPACE) $$(kubectl get pod -n $(NAMESPACE) -l app=webgitcoder -o jsonpath='{.items[0].metadata.name}') -- /bin/sh

port-forward: ## Port-forward local (localhost:8080)
	kubectl port-forward -n $(NAMESPACE) svc/webgitcoder 8080:80

restart: ## Reiniciar pods
	kubectl rollout restart deployment/webgitcoder -n $(NAMESPACE)

scale: ## Escalar deployment (use REPLICAS=N)
	kubectl scale deployment/webgitcoder --replicas=$(REPLICAS) -n $(NAMESPACE)

events: ## Ver eventos de k8s
	kubectl get events -n $(NAMESPACE) --sort-by='.lastTimestamp'

top: ## Ver uso de recursos
	kubectl top pods -n $(NAMESPACE)

all: build push deploy ## Build, push y deploy completo
