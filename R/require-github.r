require_github <- function(src) {
    require(devtools)

    #break the github path and extract the package name
    pkg = tail(strsplit(src, '/')[[1]], 1)

    #If the package isnt loaded then import it from github:
    if (!paste('package:', pkg, sep='') %in% search()) {
        install_github(src)
    }
}