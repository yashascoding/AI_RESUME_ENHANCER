import logging
import sys


def setup_logging():
    """Configure structured logging for the entire application."""
    log_format = (
        "%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s"
    )
    date_format = "%Y-%m-%d %H:%M:%S"

    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        datefmt=date_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )

    # Quiet noisy libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("motor").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)

    # Our app loggers at DEBUG for dev
    logging.getLogger("app").setLevel(logging.INFO)
    logging.getLogger("graph").setLevel(logging.INFO)


setup_logging()
log = logging.getLogger("app.main")


def main():
    import uvicorn

    log.info("Starting AI Resume Enhancer backend on port 8001...")
    uvicorn.run(
        app="app.server:app",
        host="0.0.0.0",
        port=8001,
        log_level="info",
        access_log=False,  # We handle access logs via our middleware
    )


if __name__ == "__main__":
    main()
