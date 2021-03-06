# RPC-чат
Чат работает на базе WebSocket, что бы сервер мог рассылать сообщения всем подключенным клиентам.
Data передаваемая в WebSocket описана в протоколе json-rpc v2. Сервер написан на Node.js с подключенное библиотекой
`"websocket": "^1.0.31"` т.к. Node.js нативно не поддерживает подключение по WebSocket.
Данная система должна поддерживать до 20000 пользователей.

### Запуск  
Каждая новая вкладка это новый клиент
1) Выполнить команду `npm run server`
2) Открыть в браузере `localhost:8080`

### Шифрование
В чате реализовано end-to-end шифрование следующим образом:
1) После подключения клиент отправляет рандомное число `[0,10000]` для получение ключа
2) Сервер сохраняет число из запрос, проводит вычисление и отправляет результат клиенту
3) Клиент получив число сервера вычисляет ключ используя его и отправляет ответные данные что бы сервер
мог так же его посчитать.
4) Сервер вычисляет ключ для декодирования и сохраняет его в объекте подключения

Ключ высчитывается по следующему алгоритму
1) клиент берет два рандомных числа `[0,10000]` и отправляет один на сервер
2) Сервер берет еще одно рандомное число `[0,10000]`
3) Клиент и сервер складывают общее число которое знают оба со своим случайным числом
4) Из суммы чисел берут остаток от деления на 256 и обмениваются результатами
5) Клиент и сервер складывают первое общее число с остатком от деления противоположного и повторяют операцию
6) Получившиеся число и является ключем для шифрования/дешифрования сообщений

После потери соединения ключ генерируется заново.

### Автоматическое переподключение
Проверить автоматическое переподключение можно двумя способами:
1) ввести в консоли клиента `socket.close();`
2) перезапустить сервер
