
from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class Flow(Base):
    __tablename__ = "flows"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    state = Column(Integer, default=1)
    nodes = relationship("Node", back_populates="flow", cascade="all, delete-orphan")
    result = Column(Text, nullable=True)


class Node(Base):
    __tablename__ = "nodes"
    id = Column(String, primary_key=True)
    flow_id = Column(String, ForeignKey("flows.id"), nullable=False)
    type = Column(Integer, nullable=False)
    config = Column(Text)
    flow = relationship("Flow", back_populates="nodes")
