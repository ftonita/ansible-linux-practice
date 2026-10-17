<sub>ИТОГИ · слайд 16 из 16</sub>

# От кирпичика до инфраструктуры

- 🧱 **Модуль** — кирпичик
- 📝 **Task** — уложенный кирпич
- 📜 **Playbook** — чертёж здания
- 🏗️ **Роль** — готовый блок
- 🏬 **Коллекция** — отдел магазина
- 📚 **Git = IaC** — архив чертежей

### Проверьте себя (нажмите на карточку)

<details><summary><b>Почему `shell: echo >> file` — плохой кирпичик?</b></summary>

Он не идемпотентен: каждый запуск дописывает строку заново. `lineinfile` проверяет, есть ли строка, и меняет только разницу.

</details>

<details><summary><b>Когда сработает handler `Reload nginx`?</b></summary>

Только если задача с `notify` вернула **changed**. По умолчанию — один раз в конце play; раньше — через `meta: flush_handlers`. Если play упал до этого, handler не выполнится (нужен `--force-handlers`).

</details>

<details><summary><b>Как прочитать `community.postgresql.postgresql_user`?</b></summary>

Производитель **community** · коллекция **postgresql** · модуль **postgresql_user**. Ставится через `ansible-galaxy collection install`.

</details>

> [!NOTE]
> 📌 **Дальше на практике:** разложим наш playbook на роли, подключим коллекции через `requirements.yml` и проверим идемпотентность повторным запуском.

🙌 Спасибо! Вопросы? [Часть 2: безопасный Linux-сервер →](../linux/)

<details><summary>🎤 Заметки лектора</summary>

Пройтись по лестнице слева направо: каждое понятие опирается на предыдущее. Это и есть ментальная модель Ansible.

Задать три вопроса аудитории, дать подумать 20–30 секунд и только потом открывать ответы.

Домашнее задание (по желанию): взять любой сервис из прошлой практики и разложить его настройку на роль — tasks, templates, handlers, defaults.

</details>

---

<div align="center">

[⬅️ Назад](15-iac.md) · [▶️ Интерактивная версия](https://ftonita.github.io/ansible-linux-practice/ansible/#16) · [🏠 К началу](01-title.md)

</div>
