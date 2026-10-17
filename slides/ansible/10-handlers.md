<sub>ПРИМЕР 3 ИЗ 5 · HANDLERS ПОДРОБНО · слайд 10 из 16</sub>

# Handler срабатывает не в момент notify

`notify` только **ставит handler в очередь**. Выполнится она в конце play — или раньше, на `meta: flush_handlers`.

**`web.yml`**

```yaml
- hosts: web
  become: true
  tasks:
    - name: Конфиг сайта из шаблона
      ansible.builtin.template:
        src: site.conf.j2
        dest: /etc/nginx/conf.d/shop.local.conf
      notify: Reload nginx        # не запуск, а «в очередь»
    - name: Выполнить очередь прямо сейчас
      ansible.builtin.meta: flush_handlers
    - name: Сайт отвечает с новым конфигом
      ansible.builtin.uri:
        url: http://shop.local/health
  handlers:
    - name: Reload nginx           # имя = текст в notify
      ansible.builtin.service: { name: nginx, state: reloaded }
```

> 💡 **Аналогия.** `notify` — заявка в журнал мастеру: он придёт **в конце смены**. `flush_handlers` — позвать прямо сейчас. Смену сорвали — журнал потерян.

- **notify = в очередь** — и только если задача вернула **changed**
- **Очередь — в конце play** — после каждой секции: pre_tasks, roles + tasks, post_tasks. Один раз, даже при 10 notify
- **Упал — очередь пропала** — при повторном запуске задача уже **ok**, notify не будет. Спасает `--force-handlers`
- **flush_handlers** — когда следующей задаче нужен уже перезапущенный сервис

<details><summary>🎤 Заметки лектора</summary>

Самая частая ловушка с handlers. notify не запускает handler, а только ставит его в очередь, и только если задача вернула changed.

Очередь выполняется в конце play. Точнее, после каждой секции: pre_tasks, затем roles вместе с tasks, затем post_tasks. Handler выполняется один раз, сколько бы задач его ни уведомили, и в порядке секции handlers, а не в порядке notify.

Демо, сценарий «Проверка без flush»: шаблон поменялся, reload стоит в очереди, но проверка сайта идёт раньше и падает, потому что nginx ещё работает со старым конфигом. Play прерван, очередь потеряна. Нажать «Запустить» ещё раз: шаблон уже ok, notify не случается, и мы застряли навсегда. Выход: ansible-playbook --force-handlers (или force_handlers: true в play), либо поставить meta: flush_handlers перед задачей, которой нужен перезапущенный сервис.

Сценарий «С flush_handlers»: очередь выполняется прямо в середине play, и проверка проходит.

Ещё одна мелочь: имя в notify должно совпадать с name handler-а буква в букву (или использовать listen), иначе Ansible выдаст ошибку.

</details>

---

<div align="center">

[⬅️ Назад](09-example-nginx.md) · [▶️ Интерактивная версия](https://ftonita.github.io/ansible-linux-practice/ansible/#10) · [Далее ➡️](11-example-postgresql.md)

</div>
