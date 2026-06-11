from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class NhatsTrajectory(Base):
    __tablename__ = "nhats_trajectories"

    id = Column(Integer, primary_key=True, index=True)
    asteroid_id = Column(Integer, ForeignKey("asteroids.id", ondelete="CASCADE"), nullable=False)
    min_delta_v = Column(Float, nullable=True)          # km/s
    min_duration_days = Column(Float, nullable=True)
    launch_date = Column(Date, nullable=True)
    outbound_days = Column(Integer, nullable=True)
    stay_days = Column(Integer, nullable=True)
    return_days = Column(Integer, nullable=True)
    c3 = Column(Float, nullable=True)                   # Launch energy (km^2/s^2)
    departure_v_inf = Column(Float, nullable=True)
    n_viable_trajectories = Column(Integer, nullable=True)
    occ_code = Column(Integer, nullable=True)           # Orbit condition code

    asteroid = relationship("Asteroid", back_populates="nhats_trajectory")

    def __repr__(self):
        return f"<NhatsTrajectory(asteroid_id={self.asteroid_id}, min_delta_v={self.min_delta_v})>"
