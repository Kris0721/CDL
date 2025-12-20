"""Main Flask application"""
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

# Import routes
from routes.auth import auth_bp
from routes.loans import loans_bp
from routes.admin import admin_bp
from routes.lender import lender_bp

def create_app():
    """Create and configure Flask app"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize config
    Config.init_app(app)
    
    # Enable CORS
    CORS(app, origins=Config.CORS_ORIGINS)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(loans_bp, url_prefix='/api/loans')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(lender_bp, url_prefix='/api/lender')
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'CDL Local Backend Server is running'
        }), 200
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'message': 'CDL Local Backend API',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'loans': '/api/loans',
                'admin': '/api/admin',
                'health': '/api/health'
            }
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    print("=" * 60)
    print("🚀 CDL Local Backend Server Starting...")
    print("=" * 60)
    print(f"📍 Server: http://{Config.HOST}:{Config.PORT}")
    print(f"🔗 API Base: http://localhost:{Config.PORT}/api")
    print(f"💚 Health Check: http://localhost:{Config.PORT}/api/health")
    print("=" * 60)
    print("\n📚 Available Endpoints:")
    print("  Auth:")
    print("    POST /api/auth/register")
    print("    POST /api/auth/login")
    print("    POST /api/auth/verify-otp")
    print("    POST /api/auth/refresh")
    print("    GET  /api/auth/profile")
    print("\n  Loans:")
    print("    POST /api/loans/request")
    print("    GET  /api/loans/user")
    print("    GET  /api/loans/<loan_id>")
    print("    POST /api/loans/approve")
    print("    POST /api/loans/reject")
    print("    POST /api/loans/disburse")
    print("    POST /api/loans/repay")
    print("\n  Admin:")
    print("    GET  /api/admin/loans")
    print("    GET  /api/admin/users")
    print("    GET  /api/admin/stats")
    print("=" * 60)
    print("\n✨ Press CTRL+C to stop the server\n")
    
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
