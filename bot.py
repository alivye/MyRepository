import json
import os
from pathlib import Path

from telegram import Update
from telegram.constants import ParseMode
from telegram.ext import Application, CommandHandler, ContextTypes

DATA_FILE = Path("data/users.json")


def load_data() -> dict:
    if not DATA_FILE.exists():
        return {}
    with DATA_FILE.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def save_data(data: dict) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with DATA_FILE.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    message = (
        "Привет! Я бот для поиска людей по никнейму внутри локального каталога.\n"
        "Команды:\n"
        "• /add <username> <контакт> — добавить запись\n"
        "• /find <username> — найти запись\n"
        "• /help — справка\n\n"
        "Важно: Telegram Bot API не позволяет искать произвольных пользователей "
        "по никнейму — бот ищет только по тем, кого вы сами добавили."
    )
    await update.message.reply_text(message)


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await start(update, context)


async def add_user(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not context.args or len(context.args) < 2:
        await update.message.reply_text(
            "Использование: /add <username> <контакт>",
        )
        return

    username = context.args[0].lstrip("@").lower()
    contact = " ".join(context.args[1:]).strip()

    data = load_data()
    data[username] = {
        "contact": contact,
        "added_by": update.effective_user.username or str(update.effective_user.id),
    }
    save_data(data)

    await update.message.reply_text(
        f"Готово! Запись для @{username} сохранена.",
    )


async def find_user(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not context.args:
        await update.message.reply_text("Использование: /find <username>")
        return

    username = context.args[0].lstrip("@").lower()
    data = load_data()

    record = data.get(username)
    if not record:
        await update.message.reply_text(
            f"Не нашёл @{username} в каталоге.",
        )
        return

    await update.message.reply_text(
        (
            f"<b>@{username}</b>\n"
            f"Контакт: {record['contact']}\n"
            f"Добавил: {record['added_by']}"
        ),
        parse_mode=ParseMode.HTML,
    )


def main() -> None:
    token = os.getenv("BOT_TOKEN")
    if not token:
        raise RuntimeError("Нужно задать BOT_TOKEN в переменных окружения")

    application = Application.builder().token(token).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("add", add_user))
    application.add_handler(CommandHandler("find", find_user))

    application.run_polling()


if __name__ == "__main__":
    main()
