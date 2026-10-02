"""
Leaf Check - Production ASGI Server Launcher
Runs FastAPI with Uvicorn in production configuration.
"""
import uvicorn
import multiprocessing
from backend.config import settings

def main():
    workers = min(settings.WORKERS, multiprocessing.cpu_count() or 2)
    print(f"============================================================")
    print(f" Starting {settings.PROJECT_NAME} Production Server v{settings.VERSION}")
    print(f" Environment : {settings.ENVIRONMENT}")
    print(f" Host & Port : {settings.HOST}:{settings.PORT}")
    print(f" Workers     : {workers}")
    print(f" Demo Mode   : {settings.DEMO_MODE}")
    print(f"============================================================")

    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        workers=workers,
        loop="asyncio",
        access_log=True,
        proxy_headers=True,
        forwarded_allow_ips="*"
    )

if __name__ == "__main__":
    main()
