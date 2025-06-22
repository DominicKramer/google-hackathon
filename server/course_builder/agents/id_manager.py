from typing import Dict, List


class IdManager:
    def __init__(
        self,
        placeholder_course_id: str,
        placeholder_week_ids: List[str],
        # maps week_id to list of section_ids in that week
        placeholder_week_sections: Dict[str, List[str]],
    ):
        self.placeholder_course_id = placeholder_course_id
        self.placeholder_week_ids = placeholder_week_ids
        self.placeholder_week_sections = placeholder_week_sections

    def get_course_id(self) -> str:
        return self.placeholder_course_id

    def get_week_id(self, week_index: int) -> str:
        return self.placeholder_week_ids[week_index]

    def get_section_id(self, week_index: int, section_index: int) -> str:
        week_id = self.placeholder_week_ids[week_index]
        section_ids = self.placeholder_week_sections[week_id]
        return section_ids[section_index]
