<sub>ПРИМЕР 5 ИЗ 5 · КОНТЕЙНЕРЫ · слайд 11 из 15</sub>

# Docker: сеть, том и контейнер — тоже кирпичики

**`app.yml`**

```yaml
- name: Сеть для приложения
  community.docker.docker_network:
    name: shop_net

- name: Том для данных
  community.docker.docker_volume:
    volume_name: shop_data

- name: Контейнер с API магазина
  community.docker.docker_container:
    name: shop_api
    image: ghcr.io/acme/shop-api:1.4
    networks: [{ name: shop_net }]
    volumes: ["shop_data:/var/lib/shop"]
    ports: ["8080:8080"]
    restart_policy: unless-stopped
```

**🏙️ Хост = жилой комплекс**

| Сущность | Что это и зачем |
|---|---|
| 🛣️ Сеть `shop_net` | внутренний двор |
| Контейнер `shop_api` | Квартира, построенная по типовому проекту (образу `shop-api:1.4`). Сломалась — ставим такую же. |
| Том `shop_data` | Кладовка в подвале: вещи переживут ремонт и даже снос квартиры. |
| Порт `8080:8080` | Дверь с улицы прямо в квартиру. `restart_policy` — консьерж, который откроет её снова после перезагрузки. |

<details><summary>🎤 Заметки лектора</summary>

Частый вопрос: «Если есть Docker, зачем Ansible?» Ответ: Docker упаковывает приложение, а Ansible готовит сервер и раскладывает контейнеры. Это разные кирпичики одного дома, они не конкурируют.

Аналогия с жилым комплексом: образ — типовой проект квартиры, контейнер — сама квартира, том — кладовка, которая переживёт снос квартиры, сеть — внутренний двор.

Подход тот же, что и раньше: описываем состояние. Контейнер с таким именем и образом должен работать. Если уже работает — ok.

</details>

---

<div align="center">

[⬅️ Назад](10-example-postgresql.md) · [▶️ Интерактивная версия](https://ftonita.github.io/ansible-linux-practice/#11) · [Далее ➡️](12-roles.md)

</div>
