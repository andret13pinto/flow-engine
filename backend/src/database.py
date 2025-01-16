from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os


# Create the SQLAlchemy engine
print(os.getenv("DATABASE_URL"))
engine = create_engine(os.getenv("DATABASE_URL"))

# Configure the session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    from models import Base

    # Create all tables defined in the models
    Base.metadata.create_all(bind=engine)
