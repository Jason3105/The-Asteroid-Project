from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class EvsScore(Base):
    __tablename__ = "evs_scores"

    id = Column(Integer, primary_key=True, index=True)
    asteroid_id = Column(Integer, ForeignKey("asteroids.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=True)                # Overall EVS (0-100)
    accessibility_sub = Column(Float, nullable=True)    # Accessibility sub-score (0-100)
    value_sub = Column(Float, nullable=True)            # Resource value sub-score (0-100)
    feasibility_sub = Column(Float, nullable=True)      # Feasibility sub-score (0-100)
    estimated_value_usd = Column(Float, nullable=True)  # Total mineral value in USD
    mission_cost_usd = Column(Float, nullable=True)     # Estimated mission cost in USD
    roi_ratio = Column(Float, nullable=True)            # Return on Investment
    computed_at = Column(DateTime(timezone=True), server_default=func.now())

    asteroid = relationship("Asteroid", back_populates="evs_score")

    def __repr__(self):
        return f"<EvsScore(asteroid_id={self.asteroid_id}, score={self.score})>"
