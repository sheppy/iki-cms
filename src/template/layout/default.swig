<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ attributes.title | default("Iki CMS") }}</title>
</head>
<body>
    {% block content %}{% endblock %}
</body>
</html>
