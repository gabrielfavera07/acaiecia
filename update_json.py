import json

# Carregar o JSON
with open('products_with_prices.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Adicionar campo 'ativo': true em todos os produtos
for categoria in data['categorias']:
    for item in categoria['itens']:
        item['ativo'] = True

# Salvar o JSON atualizado
with open('products_with_prices.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('Campo "ativo" adicionado com sucesso a todos os produtos!')
