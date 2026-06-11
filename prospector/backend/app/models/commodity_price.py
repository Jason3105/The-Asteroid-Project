from sqlalchemy import Column, Integer, Float, String, DateTime, func
from app.database import Base


class CommodityPrice(Base):
    __tablename__ = "commodity_prices"

    id = Column(Integer, primary_key=True, index=True)
    metal = Column(String(50), nullable=False, index=True)
    price_per_kg_usd = Column(Float, nullable=False)
    source = Column(String(100), nullable=True)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<CommodityPrice(metal={self.metal}, price={self.price_per_kg_usd})>"
