# Mini Data Stories

Mini Cosmic Data Stories built using WorldWide Telescope.

## Developer quick start

1. Check out the repository to your machine
2. If necessary, install [Node.js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/)
3. `yarn` to install dependencies

4. Build the common package:
    ```
    cd common
    yarn build
    ```
5. Build the story you want to run:
    ```
    cd ../<story-folder-name>
    yarn build
    ```
6. Run the development server for a particular story (within the folder for that story):
    ```
    yarn serve
    ```
