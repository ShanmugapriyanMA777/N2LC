from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import generate, analyze, compile, execute, fix, health, history, pipeline

app = FastAPI(
    title="NL2C Compiler API",
    description="Backend service for Natural Language to C Code Compiler using Generative AI",
    version="1.0.0"
)

# Enable CORS for local Vite development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(generate.router, prefix="/api", tags=["AI Generation"])
app.include_router(analyze.router, prefix="/api", tags=["Compiler Pipeline"])
app.include_router(compile.router, prefix="/api", tags=["GCC Compiler"])
app.include_router(execute.router, prefix="/api", tags=["Execution Sandbox"])
app.include_router(fix.router, prefix="/api", tags=["AI Error Correction"])
app.include_router(pipeline.router, prefix="/api", tags=["Unified Pipeline"])
app.include_router(health.router, prefix="/api", tags=["System Health"])
app.include_router(history.router, prefix="/api", tags=["History"])


@app.get("/")
async def root():
    return {
        "message": "NL2C Compiler API Server Active",
        "documentation": "/docs",
        "health": "/api/health"
    }
