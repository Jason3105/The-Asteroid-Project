from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class PhysicalParams(Base):
    __tablename__ = "physical_params"

    id = Column(Integer, primary_key=True, index=True)
    asteroid_id = Column(Integer, ForeignKey("asteroids.id", ondelete="CASCADE"), nullable=False)
    abs_magnitude = Column(Float, nullable=True)        # H magnitude
    diameter_km = Column(Float, nullable=True)
    diameter_min_m = Column(Float, nullable=True)
    diameter_max_m = Column(Float, nullable=True)
    albedo = Column(Float, nullable=True)
    density = Column(Float, nullable=True)              # g/cm^3
    rotation_period_h = Column(Float, nullable=True)
    spectral_type_tholen = Column(String(10), nullable=True)
    spectral_type_smass = Column(String(10), nullable=True)

    asteroid = relationship("Asteroid", back_populates="physical_params")

    def __repr__(self):
        return f"<PhysicalParams(asteroid_id={self.asteroid_id}, diameter_km={self.diameter_km})>"
