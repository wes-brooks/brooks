load_https <- function(url, ...) {
  # load package
  require(RCurl)
 
  # Import the data:
  read.table(text = getURL(url,
    followlocation=TRUE, cainfo=system.file("CurlSSL", "cacert.pem", package="RCurl")),
    ...)
}
