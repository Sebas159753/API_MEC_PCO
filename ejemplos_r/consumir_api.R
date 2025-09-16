# Ejemplo de consumo de API desde R usando httr
# Instalar paquetes si no los tienes:
# install.packages(c("httr", "jsonlite", "dplyr"))

library(httr)
library(jsonlite)
library(dplyr)

# Configuración de la API
API_BASE_URL <- "https://api-mec-pco.onrender.com"
API_KEY <- "prueba"

# Función para hacer requests con API key
api_request <- function(endpoint, api_key = API_KEY) {
  url <- paste0(API_BASE_URL, endpoint)
  
  response <- GET(
    url,
    add_headers("x-api-key" = api_key),
    timeout(30)
  )
  
  if (status_code(response) == 200) {
    content(response, "parsed")
  } else {
    stop(paste("Error:", status_code(response), content(response, "text")))
  }
}

# 1. Obtener información de la API
cat("=== Información de la API ===\n")
info <- api_request("/")
print(info)

# 2. Health Check
cat("\n=== Health Check ===\n")
health <- api_request("/health")
print(health)

# 3. Obtener datos (10 registros)
cat("\n=== Obteniendo datos ===\n")
data_response <- api_request("/data?limit=10")

# Extraer los datos del response
if ("data" %in% names(data_response)) {
  df <- data.frame(do.call(rbind, data_response$data))
  
  cat("Datos obtenidos:\n")
  cat("- Total de registros:", nrow(df), "\n")
  cat("- Columnas:", ncol(df), "\n")
  cat("- Nombres de columnas:", paste(names(df), collapse = ", "), "\n")
  
  # Mostrar primeras filas
  print(head(df))
  
  # Guardar en CSV si quieres
  write.csv(df, "datos_api.csv", row.names = FALSE)
  cat("\nDatos guardados en 'datos_api.csv'\n")
  
} else {
  cat("No se encontraron datos en la respuesta\n")
}

# 4. Función para obtener datos con diferentes límites
get_api_data <- function(limit = 10) {
  endpoint <- paste0("/data?limit=", limit)
  response <- api_request(endpoint)
  
  if ("data" %in% names(response)) {
    return(data.frame(do.call(rbind, response$data)))
  } else {
    return(NULL)
  }
}

# Ejemplo de uso
cat("\n=== Ejemplo con 5 registros ===\n")
df_small <- get_api_data(5)
if (!is.null(df_small)) {
  print(df_small)
}
