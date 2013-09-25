load_https <- function(url, sep=',', header=TRUE, row.names=NULL, ...) {
  # load package
  require(RCurl)
 
  # Import the data:
  read.table(text = getURL(url,
    followlocation=TRUE, cainfo=system.file("CurlSSL", "cacert.pem", package="RCurl")),
    sep=sep, header=header, row.names=row.names, ...)
}
