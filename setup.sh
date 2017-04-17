#!/bin/bash
#http://stackoverflow.com/a/14203146/1454477
# Use > 1 to consume two arguments per pass in the loop (e.g. each
# argument has a corresponding value to go with it).
# Use > 0 to consume one or more arguments per pass in the loop (e.g.
# some arguments don't have a corresponding value to go with it such
# as in the --default example).
# note: if this is set to > 0 the /etc/hosts part is not recognized ( may be a bug )
while [[ $# > 1 ]]
do
key="$1"

case $key in
    -c|--checkout-branch)
    BRANCH="$2"
    shift # past argument
    ;;
    *)
            # unknown option
    ;;
esac
shift # past argument or value
done

if [ -n $BRANCH ]; then
  printf "\n\nSwitching to branch " $BRANCH;
  git checkout $BRANCH
fi

cd backend;

printf "\n\nInstalling and activating Virtualenv"
virtualenv venv;
source venv/bin/activate;

printf "\n\nInstalling Requirements..."
pip install -r requirements.pip;

printf "\n\nIgnore local settings"
git update-index --assume-unchanged backend/local_settings.py

cd ../ui;

printf "\n\nInstalling Node Modules";
npm install

printf "\n\nInstalling Bower Modules";
bower install --allow-root;

printf "\n\nGRUNT!";
grunt init

cd ..;

printf "\n\nCopying vimrc";
cp .vimrc ~/

printf "\n\nDone!";

