from sqlalchemy.orm import Session
from app.models import Dependency, Sponsor, Agreement, Commitment, BudgetLine, Deliverable, Task
from typing import List, Dict, Set, Any

def get_entity_dependencies(db: Session, entity_type: str, entity_id: int):
    # Downstream and upstream dependencies
    downstream = db.query(Dependency).filter(
        Dependency.source_entity_type == entity_type,
        Dependency.source_entity_id == entity_id
    ).all()
    upstream = db.query(Dependency).filter(
        Dependency.target_entity_type == entity_type,
        Dependency.target_entity_id == entity_id
    ).all()
    return {"downstream": downstream, "upstream": upstream}

def traverse_cascade(db: Session, root_entity_type: str, root_entity_id: int) -> Dict[str, Any]:
    """
    Traverses all downstream dependencies from the root entity (e.g. sponsor)
    Returns:
    - direct_nodes: (type, id) directly connected
    - indirect_nodes: (type, id) 2+ hops away
    - all_edges: list of dependencies traversed
    """
    visited_nodes: Set[tuple] = {(root_entity_type, root_entity_id)}
    direct_nodes: Set[tuple] = set()
    indirect_nodes: Set[tuple] = set()
    edges: List[Dependency] = []

    # Queue of (type, id, depth)
    queue = [(root_entity_type, root_entity_id, 0)]

    while queue:
        curr_type, curr_id, depth = queue.pop(0)
        out_edges = db.query(Dependency).filter(
            Dependency.source_entity_type == curr_type,
            Dependency.source_entity_id == curr_id
        ).all()

        for edge in out_edges:
            edges.append(edge)
            target = (edge.target_entity_type, edge.target_entity_id)
            if target not in visited_nodes:
                visited_nodes.add(target)
                if depth == 0:
                    direct_nodes.add(target)
                else:
                    indirect_nodes.add(target)
                queue.append((edge.target_entity_type, edge.target_entity_id, depth + 1))

    return {
        "root": (root_entity_type, root_entity_id),
        "direct": list(direct_nodes),
        "indirect": list(indirect_nodes),
        "edges": edges
    }
