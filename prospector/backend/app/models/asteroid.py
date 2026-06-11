from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Asteroid(Base):
    __tablename__ = "asteroids"

    id = Column(Integer, primary_key=True, index=True)
    designation = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(200), nullable=True)
    spkid = Column(String(20), nullable=True)
    is_neo = Column(Boolean, default=False)
    is_pha = Column(Boolean, default=False)
    orbit_class = Column(String(10), nullable=True)
    last_synced = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    orbital_elements = relationship("OrbitalElements", back_populates="asteroid", uselist=False, cascade="all, delete-orphan")
    physical_params = relationship("PhysicalParams", back_populates="asteroid", uselist=False, cascade="all, delete-orphan")
    composition = relationship("Composition", back_populates="asteroid", uselist=False, cascade="all, delete-orphan")
    nhats_trajectory = relationship("NhatsTrajectory", back_populates="asteroid", uselist=False, cascade="all, delete-orphan")
    evs_score = relationship("EvsScore", back_populates="asteroid", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Asteroid(designation={self.designation}, full_name={self.full_name})>"
