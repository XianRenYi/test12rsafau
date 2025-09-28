import mqtt from 'mqtt';
import { getToken } from '@/utils/auth';

const mqttTool = {
  client: null,

  /** 连接Mqtt */
  connect() {
    const options = {
      username: '1234567890',
      password: 'wu@122131421',
      cleanSession: true,
      keepAlive: 30,
      clientId: 'web-' + Math.random().toString(16).substr(2),
      connectTimeout: 60000,
    };
    
    // 配置Mqtt地址
    var  url = 'wss://www.cbiet.com:8084/mqttwss';
    //let url = 'ws://localhost:8083/mqtt';
    console.log('mqtt地址：', url);
    this.client = mqtt.connect(url, options);
    
    this.client.on('connect', (e) => {
      console.log('mqtt连接成功');
    });
    
    // 重新连接
    this.client.on('reconnect', (error) => {
      console.log('正在重连:', error);
    });
    
    // 发生错误
    this.client.on('error', (error) => {
      console.log('Mqtt客户端连接失败：', error);
      this.client.end();
    });
    
    // 断开连接
    this.client.on('close', () => {
      console.log('已断开Mqtt连接');
    });
  },
  
  /** 断开连接 */
  end() {
    return new Promise((resolve) => {
      if (this.client == null) {
        resolve('未连接');
        console.log('未连接');
        return;
      }
      this.client.end();
      this.client = null;
      console.log('Mqtt服务器已断开连接！');
      resolve('连接终止');
    });
  },
  
  /** 重新连接 */
  reconnect() {
    return new Promise((resolve) => {
      if (this.client == null) {
        resolve('未连接');
        console.log('未连接');
        return;
      }
      console.log('正在重连...');
      this.client.reconnect();
      resolve();
    });
  },
  
  /** 消息订阅 */
  subscribe(topics) {
    return new Promise((resolve) => {
      if (this.client == null) {
        resolve('未连接');
        console.log('未连接');
        uni.showToast({
          icon: 'none',
          title: 'mqtt未连接',
        });
        return;
      }
      
      this.client.subscribe(
        topics,
        { qos: 1 },
        (err, res) => {
          console.log('订阅主题：', topics);
          if (!err) {
            console.log('订阅成功');
            resolve('订阅成功');
          } else {
            console.log('订阅失败，主题可能已经订阅');
            resolve('订阅失败');
          }
        }
      );
    });
  },
  
  /** 取消订阅 */
  unsubscribe(topics) {
    return new Promise((resolve) => {
      if (this.client == null) {
        resolve('未连接');
        console.log('未连接');
        return;
      }
      
      this.client.unsubscribe(topics, (err) => {
        if (!err) {
          resolve('取消订阅成功');
          console.log('取消订阅成功');
        } else {
          resolve('取消订阅失败');
          console.log('取消订阅失败');
        }
      });
    });
  },
  
  publish(topic, message, name) {
    return new Promise((resolve, reject) => {
      if (this.client == null) {
        resolve('Mqtt客户端未连接');
        console.log('Mqtt客户端未连接');
        return;
      }
      
      this.client.publish(topic, message, { qos: 1 }, (err) => {
        console.log('发送主题：', topic);
        console.log('发送内容：', message);
        if (!err) {
          if (topic.includes('offline')) {
            console.log(`[ ${name} ] 影子指令发送成功`);
            resolve(`[ ${name} ] 影子指令发送成功`);
          } else {
            console.log(`[ ${name} ] 指令发送成功`);
            resolve(`[ ${name} ] 指令发送成功`);
          }
        } else {
          console.log(`[ ${name} ] 指令发送失败`);
          reject(`[ ${name} ] 指令发送失败`);
        }
      });
    });
  }
};

export default mqttTool;