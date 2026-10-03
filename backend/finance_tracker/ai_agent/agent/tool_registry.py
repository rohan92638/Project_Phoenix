from finance_tracker.ai_agent.tools.finance.get_transactions import get_transactions, get_transactions_schema
from finance_tracker.ai_agent.tools.finance.get_financial_summary import get_financial_summary, get_financial_summary_schema
from finance_tracker.ai_agent.tools.finance.calculate_budget import calculate_budget, calculate_budget_schema
from finance_tracker.ai_agent.tools.finance.analyze_spending import analyze_spending, analyze_spending_schema
from finance_tracker.ai_agent.tools.finance.project_spending import project_spending, project_spending_schema
from finance_tracker.ai_agent.tools.memory.search_financial_memory import search_financial_memory, search_financial_memory_schema
from finance_tracker.ai_agent.tools.finance.add_transaction import add_transaction, add_transaction_schema

AVAILABLE_TOOLS = {
    "get_transactions": get_transactions,
    "get_financial_summary": get_financial_summary,
    "calculate_budget": calculate_budget,
    "analyze_spending": analyze_spending,
    "project_spending": project_spending,
    "search_financial_memory": search_financial_memory,
    "add_transaction": add_transaction,
}

TOOL_SCHEMAS = [
    get_transactions_schema,
    get_financial_summary_schema,
    calculate_budget_schema,
    analyze_spending_schema,
    project_spending_schema,
    search_financial_memory_schema,
    add_transaction_schema,
]

def get_tool_function(tool_name: str):
    return AVAILABLE_TOOLS.get(tool_name)
