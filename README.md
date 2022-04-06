# SecFit

SecFit (Secure Fitness) is a hybrid mobile application for fitness logging.

**Table of Contents**

- [Deployment](#deployment)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Running with Docker](#running-with-docker)
- [Local Setup](#local-setup)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Recommendations](#recommendations)
- [Running Tests](#running-tests)
  - [Django Tests](#django-tests)
  - [Cypress Tests](#cypress-tests)
  - [Data Flow Tests](#data-flow-tests)

## Deployment

The application is deployed as two applications on Heroku: one for the frontend, and one for the backend. Their links are as follows:

- Frontend: https://ase-group4-secfit-frontend.herokuapp.com
- Backend: https://ase-group4-secfit-backend.herokuapp.com

The application is configured to deploy automatically on pushes to the `main` branch, using GitHub Actions as specified in `.github/workflows`.

## Tech Stack

- **Deployment** Heroku
- **Proxy** Nginx
- **Database** PostgreSQL
- **Backend** Django 3 with Django REST framework
- **Frontend**
  - **Browser** - HTML5/CSS/JS, Bootstrap v5 (no jQuery dependency)
  - **Mobile** Apache Cordova (uses same website)
- **Authentication** JWT

## Project Structure

- `frontend/` - folder for the SecFit frontend and related tests
  - `www/` - HTML, CSS and JavaScript files for the website
  - `cypress/` - Cypress tests of SecFit
  - `codeql/` - data flow queries and tests
  - `package.json` - Node.js dependencies
- `backend/` - Django project folder containing the project modules
  - `[app_name]/` - generic structure of a Django application
    - `models.py` - contains data models
    - `serializers.py` - contains serializer definitions for sending data between backend and frontend
    - `views.py` - contains methods for accepting and processing user data
    - `urls.py` - contains mappings between endpoints and views
    - `mixins.py` - contains classes that can be injected into views for extra functionality
    - `permissions.py` - contains custom permissions that govern access
    - `parsers.py` - contains custom parsers for parsing the body of HTTP requests
    - `tests.py` - contains tests for the module (see [Testing in Django](https://docs.djangoproject.com/en/2.1/topics/testing/) for more)
    - `admin.py` - file containing definitions to connect models to the Django admin panel
    - `settings.py` - Contains important settings at the application and/or project level
  - `workouts/` - application handling exercises and workouts
  - `meals/` - application handling meals and ingredients
  - `users/` - application handling users and requests
  - `comments/` - application handling user comments and reactions
  - `secfit/` - the project's main module, containing project-level settings
  - `media/` - directory for file uploads (need to commit it for Heroku)
  - `manage.py` - entry point for running the project
  - `requirements.txt` - Python dependencies
  - `seed.json` - contains seed data for the project to get it up and running quickly

## Running with Docker

1. **Install prerequisites**
   - Docker (https://www.docker.com/products/docker-desktop)
   - Git (https://git-scm.com/downloads)
2. **Clone repo**

```
git clone https://github.com/ase-group4/secfit.git
cd secfit
```

3. **Run with Docker** (make sure to have Docker Desktop open)

```
docker compose up --build
```

This hosts the application on http://localhost:8080.

## Local Setup

After cloning the repo (following [step 2 above](#running-with-docker)), follow these steps:

### Backend

1. **Verify your Python version**

```
python3 --version
```

If output is something other than `3.8.10`, either [install it here](https://www.python.org/downloads/) or set up [pyenv](https://github.com/pyenv/pyenv#readme).

2. **Navigate to the `secfit/backend` folder**

```
cd backend
```

3. **Set up Python virtual environment**

```
python3 -m venv venv
source venv/bin/activate
```

Whenever you launch a new terminal session for the project, remember to re-run `source venv/bin/activate`.

4. **Install Python dependencies**

```
pip install -r dev-requirements.txt
```

`dev-requirements.txt` includes `requirements.txt`, but adds dependencies for formatting and linting that are required for pre-commit hooks.

5. **Run database migrations**

```
python3 manage.py migrate
```

6. **Create Django superuser**

```
python3 manage.py createsuperuser
```

7. **Run server**

```
python3 manage.py runserver
```

This starts the server on `localhost:8000`.

8. **Add initial data**

```
python3 manage.py loaddata
```

### Frontend

1. **Download Node.js** (https://nodejs.org/en/)

2. **Navigate to the `secfit/frontend` folder**

```
cd frontend
```

3. **Install dependencies**

```
npm ci
```

This will also install `husky` and `lint-staged`, to lint and format code changes on every commit. This can be skipped by using the `--no-verify` flag on commit, though this should only be used when absolutely necessary.

4. **Run Cordova**

```
cordova run browser --port=3000
```

This runs the application on `localhost:3000`. To run it for a different platform, substitute `browser` in the above command with `android` or `ios`.

Additional Cordova resources:

- CLI guide<br>https://cordova.apache.org/docs/en/latest/guide/cli/
- Using Android emulator<br>https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html

### Recommendations

If developing the project in VSCode, we recommend installing the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [Pylance](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance) extensions to get the best developer experience, and enabling the `Format On Save` setting. SecFit has configured `eslint` for frontend linting, `prettier` for frontend formatting, `flake8` for backend linting, and `black` for backend formatting.

## Running Tests

The following sections describe how to run the various types of tests made for SecFit.

### Django Tests

Django tests are located in `tests.py` inside each app in `backend`. `workouts` and `users` are the most thoroughly tested apps.

To run the tests, do the following in the terminal:

1. **Navigate to the `secfit/backend` folder**

```
cd backend
```

2. **Run the tests**

```
python3 manage.py test
```

To run the tests with coverage report, run this command instead:

```
python3 manage.py test --testrunner django_nose.NoseTestSuiteRunner --with-coverage
```

To run tests in a specific package with coverage report, run this command instead:

```
python3 manage.py test {PACKAGE_NAME}.tests --testrunner django_nose.NoseTestSuiteRunner --with-coverage --cover-package {PACKAGE_NAME}
```

...for example for the workouts package:

```
python3 manage.py test workouts.tests --testrunner django_nose.NoseTestSuiteRunner --with-coverage --cover-package workouts
```

If `django_nose` or `coverage` are missing, make sure that you have installed dependencies:

```
pip install -r requirements.txt
```

### Cypress Tests

The `frontend/cypress/integration` folder contains integration tests, boundary value tests, two-way domain tests, black-box tests of workout visibility functionality, and tests to preserve code correctness following a refactor of SecFit.

To run the tests, there needs to be a locally running instance of the backend for the tests to send requests to. Setup for this is [explained above](#backend).

While running the backend, do the following in the terminal to run the tests:

1. **Navigate to the `secfit/frontend` folder**

```
cd frontend
```

2. **Run the tests** (must have [Node](https://nodejs.org/en/) installed)

```
npx cypress run
```

Individual tests can be run in the terminal using the `--spec` flag with the path to the test, as documented in the [Cypress documentation](https://docs.cypress.io/guides/guides/command-line#cypress-run-spec-lt-spec-gt).

The tests can also be run in Cypress Test Runner, using this command:

```
npx cypress open
```

If you encounter any issues, refer to the Cypress documentation: https://docs.cypress.io/.

### Data Flow Tests

The `frontend/codeql` folder contains [CodeQL queries](https://codeql.github.com/) to analyze the data flow of the `retrieveWorkoutImages` function in `frontend/www/scripts/gallery/gallery.js`. The `gallery` folder contains further CodeQL files to test that the queries follow the all-uses (AU) strategy.

To run the tests, do the following in the terminal:

1. **Install the CodeQL CLI** (https://codeql.github.com/docs/codeql-cli/getting-started-with-the-codeql-cli/)

2. **Navigate to the `secfit/frontend` folder**

```
cd frontend
```

3. **Clone the CodeQL repo** (and alias it as `codeql-repo` to avoid name collision with the SecFit `codeql` folder)

```
git clone https://github.com/github/codeql.git codeql-repo
```

4. **Run the tests**

```
codeql test run --search-path=codeql www/scripts/gallery --additional-packs ./codeql-repo
```

If you encounter any issues, refer to the CodeQL documentation on custom query testing: https://codeql.github.com/docs/codeql-cli/testing-custom-queries/.
