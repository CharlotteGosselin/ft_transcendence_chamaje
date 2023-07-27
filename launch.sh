#!/bin/bash

BOLD=$(tput bold)
END_C=$(tput sgr0)

# run npm install
printf "
░█▀█░█▀█░█▄█░░░▀█▀░█▀█░█▀▀░▀█▀░█▀█░█░░░█░░
░█░█░█▀▀░█░█░░░░█░░█░█░▀▀█░░█░░█▀█░█░░░█░░
░▀░▀░▀░░░▀░▀░░░▀▀▀░▀░▀░▀▀▀░░▀░░▀░▀░▀▀▀░▀▀▀

"
root_dir=$(git rev-parse --show-toplevel)
echo "Installing NestJs packages..."
cd $root_dir/nestjs && npm install
echo
echo "Installing React packages..."
cd $root_dir/react-chamaje && npm install
cd $root_dir
echo
echo "All done ! 🔥"

printf "
░█░█░█▀█░█░░░█░█░█▄█░█▀▀░█▀▀
░▀▄▀░█░█░█░░░█░█░█░█░█▀▀░▀▀█
░░▀░░▀▀▀░▀▀▀░▀▀▀░▀░▀░▀▀▀░▀▀▀

"

echo "Creating a ${BOLD}postgresql${END_C} directory..."
mkdir -p postgresql

printf "
░█▀▄░█▀█░█▀▀░█░█░█▀▀░█▀▄
░█░█░█░█░█░░░█▀▄░█▀▀░█▀▄
░▀▀░░▀▀▀░▀▀▀░▀░▀░▀▀▀░▀░▀

"
docker compose up