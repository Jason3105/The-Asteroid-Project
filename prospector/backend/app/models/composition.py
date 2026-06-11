from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Composition(Base):
    __tablename__ = "compositions"

    id = Column(Integer, primary_key=True, index=True)
    asteroid_id = Column(Integer, ForeignKey("asteroids.id", ondelete="CASCADE"), nullable=False)
    water_pct = Column(Float, default=0.0)
    iron_pct = Column(Float, default=0.0)
    nickel_pct = Column(Float, default=0.0)
    cobalt_pct = Column(Float, default=0.0)
    platinum_pct = Column(Float, default=0.0)
    gold_pct = Column(Float, default=0.0)
    rare_earth_pct = Column(Float, default=0.0)
    silicate_pct = Column(Float, default=0.0)
    carbon_pct = Column(Float, default=0.0)
    confidence = Column(Float, default=0.5)     # 0.0 to 1.0
    method = Column(String(50), default="spectral_mapping")

    asteroid = relationship("Asteroid", back_populates="composition")

    def __repr__(self):
        return f"<Composition(asteroid_id={self.asteroid_id}, confidence={self.confidence})>"
