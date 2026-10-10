# 🔍 Пример 1: Inventory и проверка связи

### Шаг 1. Описываем серверы — `inventory.ini`

```ini
[web]
web-1.example.com
web-2.example.com

[db]
db-1.example.com
```

### Шаг 2. Одна команда на все серверы

```bash
ansible all -i inventory.ini -m ping
```

```text
web-1.example.com | SUCCESS => { "ping": "pong" }
web-2.example.com | SUCCESS => { "ping": "pong" }
db-1.example.com  | SUCCESS => { "ping": "pong" }
```

> [!TIP]
> Так же можно запускать разовые команды: `ansible web -m command -a "uptime"` — сразу на всей группе.

---

[⬅️ Назад](04-how-it-works.md) · [Далее ➡️](06-example-playbook.md)
