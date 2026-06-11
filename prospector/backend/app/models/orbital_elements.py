from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class OrbitalElements(Base):
    __tablename__ = "orbital_elements"

    id = Column(Integer, primary_key=True, index=True)
    asteroid_id = Column(Integer, ForeignKey("asteroids.id", ondelete="CASCADE"), nullable=False)
    epoch = Column(Float, nullable=True)
    eccentricity = Column(Float, nullable=True)
    semi_major_axis = Column(Float, nullable=True)
    perihelion = Column(Float, nullable=True)
    inclination = Column(Float, nullable=True)
    long_asc_node = Column(Float, nullable=True)
    arg_perihelion = Column(Float, nullable=True)
    mean_anomaly = Column(Float, nullable=True)
    period = Column(Float, nullable=True)
    moid = Column(Float, nullable=True)  # Minimum Orbit Intersection Distance

    asteroid = relationship("Asteroid", back_populates="orbital_elements")

    def __repr__(self):
        return f"<OrbitalElements(asteroid_id={self.asteroid_id}, a={self.semi_major_axis})>"
