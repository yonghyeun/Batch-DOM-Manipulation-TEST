각 node 의 method 에 따라서 위치 보정을 다르게 해야함

그 이유는

1. translate 일 때는 객체의 위치를 offsetTop 으로 가져올 수 없음
   => translate 는 offsetTop 을 계산하는 layout 과정을 거치지 않음으로서 부드러운 애니메이션을 제공 할 수 있는 것임

2. 나의 문제는 caching False / translate True 일 때 발생하는 이유는
   노드의 offsetTop 은 변화하지 않고 있기 때문에 transalte 되는 값이 그대로임

그러니까 무슨 말이나면 translate 의 값이 변화해야 애니메이션이 이동한다는 것임

3. translate 는 caching 여부에 상관없이 값만 이동하면 되는거임

translate 는 노드의 offsetTop 을 계산 할 필요조차가 없는거니까

caching 에 저장하는 값은 method 에 상관없이 실제 node 의 위치를 이용하도록 하자

caching 은 top + translateY 값을 이용해 실제 노드의 curTop 을 계산하도록 하고 실제 노드의 클래스를 변경하는 것은 이 값을 이용하도록 하자

어차피 top , translateY 값을 변경하는 것은 distnace 만큼 +- 시키면 되는거 아니냐 ?

어차피 이동하는 distance 는 class 에 따라 상관있는거니까 말이야
