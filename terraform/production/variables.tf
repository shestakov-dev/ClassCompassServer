variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "app_name" {
  description = "Name of the application"
  type        = string
}

variable "location" {
  description = "Azure region for the resources"
  type        = string
  default     = "Italy North"
}

variable "registry_username" {
  description = "Username for the container registry"
  type        = string
}

variable "registry_password_secret" {
  description = "Secret for the container registry password"
  type        = string
  sensitive   = true
}

variable "container_name" {
  description = "Server's docker container name"
  type        = string
  default     = "server"
}

variable "image_name" {
  description = "Docker image name with tag"
  type        = string
}

variable "env_vars" {
  description = "Environment variables"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}
