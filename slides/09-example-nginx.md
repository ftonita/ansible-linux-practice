<sub>ПРИМЕР 3 ИЗ 5 · ВЕБ-СЕРВЕР · слайд 9 из 15</sub>

# nginx: шаблон, переменные и реакция на изменения

**`web.yml`**

```yaml
- hosts: web
  become: true
  vars:
    site_name: shop.local
    port: 8080
  tasks:
    - name: Установить nginx
      ansible.builtin.apt:
        name: nginx
        state: present
    - name: Конфиг сайта из шаблона
      ansible.builtin.template:
        src: site.conf.j2
        dest: /etc/nginx/conf.d/{{ site_name }}.conf
      notify: Reload nginx
    - name: nginx запущен
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true
  handlers:
    - name: Reload nginx
      ansible.builtin.service:
        name: nginx
        state: reloaded
```

| Сущность | Что это и зачем |
|---|---|
| nginx — вахтёр у входа | Принимает гостей с улицы (порт 80) и провожает к нужному приложению. |

**`site.conf.j2 — бланк`**

```nginx
server {
  listen 80;
  server_name {{ site_name }};
  location / {
    proxy_pass http://127.0.0.1:{{ port }};
  }
}
```

**`shop.local.conf — заполнен`**

```nginx
server {
  listen 80;
  server_name shop.local;
  location / {
    proxy_pass http://127.0.0.1:8080;
  }
}
```

| Сущность | Что это и зачем |
|---|---|
| Шаблон + переменные | Как бланк заявления: текст один, а имя и даты каждый вписывает свои. Один шаблон подходит для сотни сайтов. |
| Handler — «позвать, если что-то поменялось» | Как перезагрузка роутера: делаем её, только если правили настройки. |

<details><summary>🎤 Заметки лектора</summary>

Здесь появляются три новых понятия: переменные, шаблоны (Jinja2) и handlers.

Шаблон — бланк с пропусками, переменные — то, что в него вписываем. Поменяли переменную port — конфиг пересоберётся сам. Тот же шаблон подойдёт для десятка сайтов.

Handler срабатывает, только если задача с notify вернула changed. Запустили playbook второй раз, конфиг не изменился — nginx никто не дёргает. Это та же идемпотентность, только на уровне реакций.

</details>

---

<div align="center">

[⬅️ Назад](08-example-users-ssh.md) · [▶️ Интерактивная версия](https://ftonita.github.io/ansible-linux-practice/#9) · [Далее ➡️](10-example-postgresql.md)

</div>
