import ollama
import os
from langchain_community.document_loaders import PyPDFLoader


async def chat_with_amirali(theQuestoin: str):
    filePath = "data/Amirali_Resume.pdf"
    global context
    if os.path.exists(filePath):
        loader = PyPDFLoader(filePath)
        pages = loader.load()
        # combining pages
        context = "\n".join([p.page_content for p in pages])

    #  AIs personality
    system_instructions = f"""
    You are an AI assistant representing Amirali. 
    Use the following resume context to answer questions about him. 
    If the answer isn't in the context, say 'I'm not sure about that, but you can contact Amirali directly.'

    Context:
    {context}
    """

    # calling local ai
    response = ollama.chat(model='llama3.2', messages=[
        {'role': 'system', 'content': system_instructions},
        {'role': 'user', 'content': theQuestoin},
    ])

    return {"answer": response['message']['content']}