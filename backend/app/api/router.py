from fastapi import APIRouter
from app.api.routes import auth, contacts, companies, deals, tasks, messages, products, invoices, system

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["Contacts"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])
api_router.include_router(deals.router, prefix="/deals", tags=["Deals"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(messages.router, prefix="/messages", tags=["Messages"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
api_router.include_router(system.router, prefix="/system", tags=["System"])

