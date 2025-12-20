@echo off
echo ============================================================
echo CDL Local Backend Setup
echo ============================================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

echo Installing dependencies...
pip install Flask==3.0.0 Flask-CORS==4.0.0 PyJWT==2.8.0 bcrypt==4.1.2 python-dotenv==1.0.0 Werkzeug==3.0.1
echo.

echo Creating .env file...
if not exist ".env" (
    copy .env.example .env
)

echo.
echo ============================================================
echo Setup complete! Now starting the server...
echo ============================================================
echo.

python app.py

pause
