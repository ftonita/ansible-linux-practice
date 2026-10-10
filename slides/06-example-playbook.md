# 📜 Пример 2: Первый playbook

Установим и запустим **nginx** на всех веб-серверах — `nginx.yml`:

```yaml
- name: Настройка веб-серверов
  hosts: web
  become: true          # выполнять с правами root
  tasks:
    - name: Установить nginx
      ansible.builtin.apt:
        name: nginx
        state: present

    - name: Запустить и включить автозапуск
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true
```

```bash
ansible-playbook -i inventory.ini nginx.yml
```

| Статус | Значение |
|---|---|
| 🟡 `changed` | Изменение применено |
| 🟢 `ok` | Уже в нужном состоянии — ничего не делали |

> [!IMPORTANT]
> Запустите второй раз — всё будет `ok`. Это и есть **идемпотентность**.

---

[⬅️ Назад](05-example-inventory.md) · [Далее ➡️](07-benefits.md)
