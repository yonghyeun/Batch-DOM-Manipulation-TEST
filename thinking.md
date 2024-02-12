각 node 의 method 에 따라서 위치 보정을 다르게 해야함

그 이유는

1. translate 일 때는 객체의 위치를 offsetTop 으로 가져올 수 없음
   => translate 는 offsetTop 을 계산하는 layout 과정을 거치지 않음으로서 부드러운 애니메이션을 제공 할 수 있는 것임

2. 나의 문제는 caching False / translate True 일 때 발생하는 이유는
   노드의 offsetTop 은 변화하지 않고 있기 때문에 transalte 되는 값이 그대로임

그러니까 무슨 말이나면 translate 의 값이 변화해야 애니메이션이 이동한다는 것임
