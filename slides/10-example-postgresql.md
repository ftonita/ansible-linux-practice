<sub>ПРИМЕР 4 ИЗ 5 · БАЗА ДАННЫХ · слайд 10 из 15</sub>

# PostgreSQL: описываем сущности базы как код

**`postgres.yml · become_user: postgres`**

```yaml
- name: База данных магазина
  community.postgresql.postgresql_db:
    name: shop
    encoding: UTF-8

- name: Роль для приложения
  community.postgresql.postgresql_user:
    name: shop_app
    password: "{{ vault_shop_db_password }}"

- name: Схема для каталога товаров
  community.postgresql.postgresql_schema:
    db: shop
    name: catalog
    owner: shop_app

- name: Пускать приложение из сети бэкенда
  community.postgresql.postgresql_pg_hba:
    dest: /etc/postgresql/16/main/pg_hba.conf
    contype: host
    databases: shop
    users: shop_app
    source: 10.0.1.0/24
    method: scram-sha-256
```

| Сущность | Что это и зачем |
|---|---|
| Роль `shop_app` | Сотрудник с бейджем: логин и пароль, под которыми приходит приложение. |
| 🐘 Сервер PostgreSQL | здание банка |
| pg_hba.conf — охрана на входе | Решает, **кого**, **откуда** и **в какую базу** пускать, и как проверять пароль. |
| 🗄️ База `shop` | отдельное хранилище со своими данными |
| Схема `catalog` | Комната внутри хранилища, где лежат таблицы товаров. |

<details><summary>🎤 Заметки лектора</summary>

Ключевой слайд. Слева код, справа те же сущности, нарисованные как здание банка. Пролистать по шагам: база, роль, схема, pg_hba.

База — отдельное хранилище. Роль — сотрудник с бейджем. Схема — комната внутри хранилища, и у неё есть владелец. pg_hba — охрана на входе: кого, откуда и куда пускать.

Важная мысль: раньше это делали руками в psql и забывали. Теперь вся структура доступа к базе описана в Git. Пароль не пишем открытым текстом, а берём из переменной: в реальной жизни из Ansible Vault (зашифрованного сейфа).

Техническая деталь: задачи выполняются от системного пользователя postgres (become_user: postgres), а модули берутся из коллекции community.postgresql.

</details>

---

<div align="center">

[⬅️ Назад](09-example-nginx.md) · [▶️ Интерактивная версия](https://ftonita.github.io/ansible-linux-practice/#10) · [Далее ➡️](11-example-docker.md)

</div>
