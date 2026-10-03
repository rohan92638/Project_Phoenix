import json
import logging
from finance_tracker.ai_agent.agent.state import AgentState
from finance_tracker.ai_agent.agent.prompts import SYSTEM_PROMPT
from finance_tracker.ai_agent.agent.tool_registry import TOOL_SCHEMAS, get_tool_function
from finance_tracker.ai_agent.agent.model_router import ModelRouter

logger = logging.getLogger(__name__)

MAX_AGENT_ITERATIONS = 5

def run_agent(user_id: int, user_message: str) -> dict:
    state = AgentState(user_id, user_message)
    
    state.conversation_messages.append({"role": "system", "content": SYSTEM_PROMPT})
    state.conversation_messages.append({"role": "user", "content": user_message})
    
    while state.iteration_count < MAX_AGENT_ITERATIONS:
        state.iteration_count += 1
        
        response_message = ModelRouter.generate_response(state.conversation_messages, tools=TOOL_SCHEMAS)
        
        if "error" in response_message:
            state.final_answer = f"I'm sorry, I encountered an error: {response_message['error']}"
            break
            
        state.conversation_messages.append(response_message)
        
        tool_calls = response_message.get("tool_calls")
        
        if not tool_calls:
            state.final_answer = response_message.get("content", "")
            break
            
        for tool_call in tool_calls:
            function_info = tool_call.get("function", {})
            tool_name = function_info.get("name")
            tool_args = function_info.get("arguments", {})
            
            tool_func = get_tool_function(tool_name)
            if not tool_func:
                result = json.dumps({"error": f"Unknown tool: {tool_name}"})
            else:
                try:
                    result = tool_func(user_id=state.user_id, **tool_args)
                except Exception as e:
                    result = json.dumps({"error": str(e)})
            
            state.tool_calls.append({"name": tool_name, "args": tool_args})
            state.tool_results.append(result)
            
            state.conversation_messages.append({
                "role": "tool",
                "content": result,
                "name": tool_name
            })
            
    if not state.final_answer:
        state.final_answer = "I apologize, but I reached my maximum thinking limit."
        
    return {
        "reply": state.final_answer,
        "tool_calls": state.tool_calls,
        "agent_iterations": state.iteration_count
    }
