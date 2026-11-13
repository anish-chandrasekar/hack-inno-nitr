from sqlalchemy.orm import Session
from app.models import Sponsor, MemoryFact
import re

def resolve_sponsor_name(db: Session, raw_name: str) -> tuple[Sponsor | None, float]:
    """
    Resolves mentions like 'NovaTech', 'Nova Technologies', 'NovaTech Pvt Ltd'
    to the canonical Sponsor record.
    Returns: (Sponsor or None, confidence_score)
    """
    clean_raw = raw_name.strip().lower()
    
    # 1. Exact match
    exact = db.query(Sponsor).filter(Sponsor.name.ilike(raw_name.strip())).first()
    if exact:
        return exact, 1.0

    # 2. Check MemoryFact aliases
    alias_fact = db.query(MemoryFact).filter(
        MemoryFact.fact_type == "alias",
        MemoryFact.value.ilike(clean_raw)
    ).first()
    if alias_fact:
        sponsor = db.query(Sponsor).filter(Sponsor.id == alias_fact.entity_id).first()
        if sponsor:
            return sponsor, alias_fact.confidence

    # 3. Substring match
    all_sponsors = db.query(Sponsor).all()
    for sp in all_sponsors:
        sp_clean = sp.name.lower()
        # strip legal suffixes
        base_sp = re.sub(r'\b(pvt|ltd|limited|inc|corp|solutions|technologies|systems)\b', '', sp_clean).strip()
        base_raw = re.sub(r'\b(pvt|ltd|limited|inc|corp|solutions|technologies|systems)\b', '', clean_raw).strip()
        
        if base_raw and (base_raw in sp_clean or base_sp in clean_raw or base_raw == base_sp):
            return sp, 0.92

    return None, 0.0
