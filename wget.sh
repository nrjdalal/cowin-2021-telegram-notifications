wget \
     --recursive \ # Download the whole site.
     --page-requisites \ # Get all assets/elements (CSS/JS/images).
     --adjust-extension \ # Save files with .html on the end.
     --span-hosts \ # Include necessary assets from offsite as well.
     --convert-links \ # Update links to still work in the static version.
     --restrict-file-names=windows \ # Modify filenames to work in Windows as well.
     --domains yoursite.com \ # Do not follow links outside this domain.
     --no-parent \ # Don't follow links outside the directory you pass in.
         yoursite.com/whatever/path # The URL to download

         wget --recursive --page-requisites --html-extension --convert-links 'https://apple.com'

wget -r