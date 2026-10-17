<sub>СТРУКТУРА · КОЛЛЕКЦИИ · слайд 14 из 16</sub>

# Коллекции: откуда берутся кирпичики

Полное имя модуля (FQCN) читается как адрес в магазине: **кто выпустил · какой отдел · какой товар**.

`community.postgresql.postgresql_db`

| Часть | Смысл |
|---|---|
| `community` | **namespace**производитель |
| `postgresql` | **коллекция**отдел по одной теме |
| `postgresql_db` | **модуль**конкретный кирпичик |

**`requirements.yml — список покупок`**

```yaml
collections:
  - name: community.general
  - name: community.postgresql
  - name: community.docker
  - name: ansible.posix
```

**`терминал`**

```bash
$ ansible-galaxy collection install -r requirements.yml
```

- **ansible.builtin** — базовые: apt, copy, user, service
- **community.general** — всё понемногу: ufw, timezone…
- **community.postgresql** — базы, роли, схемы, pg_hba
- **community.docker** — контейнеры, сети, тома
- **ansible.posix** — authorized_key, sysctl, mount
- **amazon.aws · kubernetes.core** — облака и кластеры

> 💡 **Аналогия.** **Ansible Galaxy** — магазин, коллекция — отдел, `requirements.yml` — список покупок, чтобы у всех в команде были одинаковые кирпичи.

<details><summary>🎤 Заметки лектора</summary>

Отвечаем на вопрос, который возникал на примерах: почему одни модули называются ansible.builtin.*, а другие community.*?

FQCN читается слева направо, как адрес: производитель, отдел, товар. ansible.builtin поставляется вместе с Ansible. Остальное докупается через ansible-galaxy.

requirements.yml фиксирует, какие коллекции нужны проекту, чтобы у всех в команде и в CI были одинаковые кирпичики. Это тоже часть подхода «инфраструктура как код».

</details>

---

<div align="center">

[⬅️ Назад](13-roles.md) · [▶️ Интерактивная версия](https://ftonita.github.io/ansible-linux-practice/#14) · [Далее ➡️](15-iac.md)

</div>
