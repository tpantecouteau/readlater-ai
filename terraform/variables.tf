# =============================================================================
# Variables
# =============================================================================

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-west-3" # Paris - proche de toi
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "readlater"
}

# Database variables
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "readlater"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# EC2 variables
variable "ec2_key_name" {
  description = "Name of the SSH key pair for EC2 access"
  type        = string
}

variable "my_ip" {
  description = "Your public IP for SSH access (format: x.x.x.x/32)"
  type        = string
  default     = "0.0.0.0/0" # À restreindre en prod !
}
