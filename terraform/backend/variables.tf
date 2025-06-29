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

variable "container_name" {
  description = "Storage container name"
  type        = string
}
