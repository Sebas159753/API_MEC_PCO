# Ejemplo usando curl desde R
# install.packages("curl")

library(curl)
library(jsonlite)

# Configuración
API_URL <- "https://api-mec-pco.onrender.com"
API_KEY <- "prueba"

# Función para hacer requests con curl
api_curl_request <- function(endpoint) {
  url <- paste0(API_URL, endpoint)
  
  # Crear handle con headers
  h <- new_handle()
  handle_setheaders(h, "x-api-key" = API_KEY)
  
  # Hacer request
  response <- curl_fetch_memory(url, handle = h)
  
  if (response$status_code == 200) {
    jsonlite::fromJSON(rawToChar(response$content))
  } else {
    stop(paste("Error:", response$status_code))
  }
}

# Ejemplo de uso
cat("=== Usando curl ===\n")
data_curl <- api_curl_request("/data?limit=5")
print(data_curl)
