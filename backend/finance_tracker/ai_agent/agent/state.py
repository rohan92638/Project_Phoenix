class AgentState:
    def __init__(self, user_id: int, user_message: str):
        self.user_id = user_id
        self.user_message = user_message
        self.conversation_messages = []
        self.iteration_count = 0
        self.final_answer = None
        self.tool_calls = []
        self.tool_results = []
