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
░█▀▄░█▀█░█▀▀░█░█░█▀▀░█▀▄
░█░█░█░█░█░░░█▀▄░█▀▀░█▀▄
░▀▀░░▀▀▀░▀▀▀░▀░▀░▀▀▀░▀░▀

"
docker compose up