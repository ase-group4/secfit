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
- [Running Tests](#running-tests)
  - [Data Flow Tests](#data-flow-tests)

## Deployment

The application is deployed as two applications on Heroku: one for the frontend, and one for the backend. Their links are as follows:

- Frontend: https://ase-group4-secfit-frontend.herokuapp.com/
- Backend: https://ase-group4-secfit-backend.herokuapp.com/

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

- `requirements.txt` - Python dependencies
- `package.json` - Node.js dependencies for Cordova
- `Procfile` - Procfile for backend heroku deployment
- `frontend/` - folder for the SecFit frontend and related tests
  - `www/` - HTML, CSS and JavaScript files for the website
  - `cypress/` - Cypress tests of SecFit
  - `codeql/` - data flow queries and tests
- `backend/` - django project folder containing the project modules
  - `[app_name]/` - generic structure of a django application
    - `admin.py` - file containing definitions to connect models to the django admin panel
    - `urls.py` - contains mapping between urls and views
    - `models.py` - contains data models
    - `permissions.py` - contains custom permissions that govern access
    - `serializers.py` - contains serializer definitions for sending data between backend and frontend
    - `parsers.py` - contains custom parsers for parsing the body of HTTP requests
    - `tests/` - contains tests for the module. [View Testing in Django](https://docs.djangoproject.com/en/2.1/topics/testing/) for more.
    - `views.py` - Controller in MVC. Methods for rendering and accepting user data
    - `forms.py` - definitions of forms. Used to render html forms and verify user input
    - `settings.py` - Contains important settings at the application and/or project level
  - `media/` - directory for file uploads (need to commit it for heroku)
  - `comments/` - application handling user comments and reactions
  - `secfit/` - The projects main module containing project-level settings.
  - `users/` - application handling users and requests
  - `workouts/` - application handling exercises and workouts
  - `meals/` - application handling meals and ingredients
  - `manage.py` - entry point for running the project.
  - `seed.json` - contains seed data for the project to get it up and running quickly

## Running with Docker

1. **Install prerequisites**
   - Docker (https://www.docker.com/products/docker-desktop)
   - Python 3.8.10 (https://www.python.org/downloads/)
   - Git (https://git-scm.com/downloads)
2. **Clone repo**

```
git clone https://github.com/ase-group4/secfit.git
cd secfit
```

3. **Run with Docker** (make sure to have Docker Desktop open)

```
docker-compose up --build
```

This hosts the application on http://localhost:8080.

## Local Setup

After cloning the repo (following the [steps above](#running-with-docker)), follow these steps:

### Backend

1. **Verify your Python version**

```
python3 --version
```

If output is something other than `3.8.10`, either [update here](https://www.python.org/downloads/) or set up [pyenv](https://github.com/pyenv/pyenv#readme).

2. **Navigate to the `secfit` folder we cloned earlier**
3. **Set up Python virtual environment**

```
python3 -m venv venv
source venv/bin/activate
```

Whenever you launch a new terminal session for the project, remember to re-run `source venv/bin/activate`.

4. **Install Python dependencies**

```
pip install -r requirements.txt
```

5. **Navigate to backend folder**

```
cd backend
```

6. **Run database migrations**

```
python3 manage.py migrate
```

7. **Create Django superuser**

```
python3 manage.py createsuperuser
```

8. **Run server** (or just run it through Docker [as shown earlier](#running-with-docker))

```
python3 manage.py runserver
```

9. **Add initial data**

```
python3 manage.py loaddata
```

### Frontend

1. **Download Node.js** (https://nodejs.org/en/)
2. **Navigate to `secfit/frontend`**
3. **Install Cordova**

```
npm install -g cordova
```

4. **Run Cordova**
   - For browser: `cordova run browser`
   - For Android: `cordova run android`
   - For iOS: `cordova run ios`

Additional Cordova resources:

- CLI guide<br>https://cordova.apache.org/docs/en/latest/guide/cli/
- Using Android emulator<br>https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html

## Running Tests

The following sections describe how to run the various types of tests made for SecFit.

### Full statement coverage tests

To run the tests, do the following in the terminal:

1. Navigate to the `backend` folder.

```
cd backend
```

2. Run the tests.

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

for example for the workouts package:

```
python3 manage.py test workouts.tests --testrunner django_nose.NoseTestSuiteRunner --with-coverage --cover-package workouts
```

If `django_nose` or `coverage` is missing, make sure that you have installed dependencies:

```
pip install -r requirements.txt
```

### Cypress tests (Blackbox tests)

To run the tests, there need to be a locally running instance of the backend for the tests to send requests to, set up for this is [explained above](#backend). 

While running a backend, do the following in the terminal to run the tests:

1. Navigate to the `frontend` folder.

```
cd frontend
```

2. Run the tests (must have [Node](https://nodejs.org/en/) installed).

```
npx cypress run
```

Individual tests can be run in the terminal using the `--spec` flag and giving path to the test, as documented in the [Cypress documentation](https://docs.cypress.io/guides/guides/command-line#cypress-run-spec-lt-spec-gt).

The tests can also be run in Cypress Test Runner, using this command:

```
npx cypress open
```

If you encounter any issues, refer to the Cypress documentation: https://docs.cypress.io/.

### Data Flow Tests

The `frontend/codeql` folder contains [CodeQL queries](https://codeql.github.com/) to analyze the data flow of the `retrieveWorkoutImages` function in `frontend/www/scripts/gallery/gallery.js`. The `gallery` folder contains further CodeQL files to test that the queries follow the all-uses (AU) strategy.

To run the tests, do the following in the terminal:

1. Install the CodeQL CLI: https://codeql.github.com/docs/codeql-cli/getting-started-with-the-codeql-cli/.

2. Navigate to the `frontend` folder.

```
cd frontend
```

3. Clone the CodeQL repo, and alias it as `codeql-repo` to avoid clashing with the SecFit `codeql` folder.

```
git clone https://github.com/github/codeql.git codeql-repo
```

4. Run the tests.

```
codeql test run --search-path=codeql www/scripts/gallery --additional-packs ./codeql-repo
```

If you encounter any issues, refer to the CodeQL documentation on custom query testing: https://codeql.github.com/docs/codeql-cli/testing-custom-queries/.
