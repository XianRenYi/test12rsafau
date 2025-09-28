<template>
    <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="场景名称" prop="sceneName">
          <el-input
            v-model="queryParams.sceneName"
            placeholder="请输入场景名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
    
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
  
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['iot:scene:add']"
          >新增</el-button>
        </el-col>
        <!-- <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['iot:scene:edit']"
          >修改</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['iot:scene:remove']"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['iot:scene:export']"
          >导出</el-button>
        </el-col> -->
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
  
  
  
      <el-table v-loading="loading" :data="sceneList" :border="false" @selection-change="handleSelectionChange">
        <el-table-column :label="'场景名称'" align="center" prop="sceneName" min-width="200" />
              <el-table-column :label="'备注'" align="center" prop="remark"/>
        <el-table-column :label="'状态'" align="center" prop="enable" width="80">
            <template #default="scope">
                <el-tag type="success"  v-if="scope.row.enable == 1">启用</el-tag>
                <el-tag type="danger"  v-if="scope.row.enable == 2 || scope.row.enable == 0">禁用</el-tag>
            </template>
        </el-table-column>
        <el-table-column :label="'是否告警'" align="center" prop="hasAlert" width="80">
            <template #default="scope">
                <span v-if="scope.row.hasAlert == 1">是</span>
                <span v-if="scope.row.hasAlert == 2">否</span>
            </template>
        </el-table-column>
        <!-- <el-table-column :label="'触发条件'" align="center" prop="cond" width="80">
            <template #default="scope">
                <span v-if="scope.row.cond == 1">全部满足</span>
                <span v-if="scope.row.cond == 2">任一满足</span>
                <span v-if="scope.row.cond == 3">全部不满足</span>
            </template>
        </el-table-column>
        <el-table-column :label="'执行方式'" align="center" prop="executeMode" width="80">
            <template #default="scope">
                <span v-if="scope.row.executeMode == 1">单次执行</span>
                <span v-if="scope.row.executeMode == 2">循环执行</span>
            </template>
        </el-table-column>
        <el-table-column :label="'静默时间'" align="center" prop="silentPeriod" width="80">
            <template #default="scope">
                <span>{{ scope.row.silentPeriod }} 分钟</span>
            </template>
        </el-table-column>
        <el-table-column :label="'延时执行'" align="center" prop="executeDelay" width="80">
            <template #default="scope">
                <span>{{ scope.row.executeDelay }} 秒钟</span>
            </template>
        </el-table-column> -->
    
        <el-table-column :label="'更新时间'" align="center" prop="createTime" width="120">
            <template #default="scope">
                <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            </template>
        </el-table-column>
        <el-table-column fixed="right" :label="'操作'" align="center" width="300">
            <template #default="scope">
                <el-button size="mini" type="text" icon="el-icon-view" @click="handleUpdate(scope.row)" v-hasPermi="['iot:scene:query']">编辑</el-button>
                <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['iot:scene:remove']">删除</el-button>
                <!-- <el-button size="mini" type="text" icon="el-icon-caret-right" @click="handleRun(scope.row)" v-hasPermi="['iot:scene:run']">执行</el-button> -->
                <!-- <el-button size="mini" type="text" icon="el-icon-view" @click="handleLog(scope.row)" v-hasPermi="['iot:scene:run']">查看日志</el-button> -->
            </template>
        </el-table-column>
    </el-table>
  
      <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
  
      <!-- 添加或修改场景联动对话框 -->
        <el-dialog class="scene-config-dialog" :title="title" v-model="open"  width="1200px" append-to-body :close-on-click-modal="false" :close-on-press-escape="false">
       
        <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
          <el-card >
            <el-form-item label="场景名称" prop="sceneName">
              <el-input v-model="form.sceneName" placeholder="请输入场景名称" />
            </el-form-item>
            <el-form-item :label="'场景状态'">
              <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
    
          </el-card>
          <br/>


          <el-card >
  
            

   
          <el-tabs v-model="activeName" >
            <el-tab-pane :label="'关联触发器'" name="relateScene">
                <scene-list-alert   ref="sceneListRef"      @sceneEvent="getSceneData" />
                <product-list-alert ref="productListRef"    @productEvent="getSelectProduct"  />
                <device-list-alert  ref="deviceListRef"     @deviceEvent="getSelectDevice"  />
       


       
                    <div class="condition-wrap">
                      <el-form-item   prop="triggers">
            
                        <span style="margin-left: 0px; font-size: 15px">提示：触发器,选择设备或产品，因子的参数参数大于或者小于某个参数时候触发</span>
                          <div class="item-wrap" style="display:none;background-color: #eef3f7;width: 91%;box-shadow: 2px 2px 2px rgba(0, 0, 0, .4), -2px -2px 2px rgba(255, 255, 255, .9);">
                           
                              <el-row :gutter="16">
                                  <el-col :span="24">
                                    <span>触发条件：</span>
                                    <el-select v-model="form.cond" :placeholder="'请选择触发条件'"  style="width: 160px">
                                        <el-option key="1" :label="'任意条件'" :value="1" />
                                        <el-option key="2" :label="'所有条件'" :value="2" />
                                        <el-option key="3" :label="'不满足'" :value="3" :disabled="formJson.triggers.length > 1" />
                                    </el-select>
                                 
                                  </el-col>
                              </el-row>
                          </div>
                      
            
                          <div class="item-wrap" style="background-color: #eef3f7;width: 91%;box-shadow: 2px 2px 2px rgba(0, 0, 0, .4), -2px -2px 2px rgba(255, 255, 255, .9);"  v-for="(item, index) in formJson.triggers" :key="index">
                              <el-row :gutter="16">
                                  <el-col :span="5">
                                    <el-select v-model="item.source" :placeholder="'请选择类型'"  @change="handleTriggerSource($event, index)" disabled>
                                      <el-option v-for="subItem in triggerSource" :key="subItem.value" :label="subItem.label" :value="subItem.value" ></el-option>
                                  </el-select>
                                  </el-col>
                                  <el-col :span="10" v-if="item.source == 1">
                                      <el-input readonly v-model="item.deviceCount"  :placeholder="'请选择设备'" style="margin-top: 3px">
                                      
                                        <template #prepend>
                                          <span>{{ '数量' }}</span>
                                        </template>
                                        
                                          <template #append>
                                            <el-button  @click="handleSelectDevice('trigger', item, index)" >选择设备</el-button>
                                          </template>
                                        </el-input>
                                
                                 
                                    </el-col>
                                  <el-col :span="10" v-if="item.source == 3">
                                      <el-input readonly v-model="item.productName"  :placeholder="'请选择产品'" style="margin-top: 3px">
                                         
                                          <template #prepend>
                                            <span>{{ '产品名称' }}</span>
                                          </template>
                                          
                                            <template #append>
                                              <el-button  @click="handleSelectProduct('trigger', item, index)" >选择产品</el-button>
                                            </template>
                                      </el-input>
                                  </el-col>
                                  <div class="delete-wrap" v-if="index != 0">
                                      <el-button  plain type="danger" style="padding: 5px" icon="Delete" @click="handleRemoveTrigger(index)">{{ '删除' }}</el-button>
                                  </div>
                              </el-row>
                              <el-row :gutter="16">
                                  <el-col :span="10" v-if="item.source == 4">
                                      <el-input v-model="item.id"  :placeholder="请填写触发ID" style="margin-top: 3px">
                                          <span  disabled>触发ID</span>
                                      </el-input>
                                      <AceEditor ref="codeEditor" :content="item.value" lang="json" codeStyle="chrome" :read-only="false" width="100%" height="200px"></AceEditor>
                                  </el-col>
                              </el-row>
                              <!--定时-->
                              <el-row v-if="item.source == 2" :gutter="16" style="margin-top: 10px">
                                  <el-col :span="5" style="padding-top:2px;">
                                      <el-time-picker
                                      style="width: 100%"
                                      v-model="item.timerTimeValue"
                                      
                                      value-format="HH:mm"
                                      format="HH:mm"
                                      :placeholder="'在设定的时间范围内将不再重复执行'"
                                      @change="timeChange($event, index)"
                                      :disabled="item.isAdvance == 1"
                                  ></el-time-picker>
                                  </el-col>
                                  <el-col :span="19" style="padding-top:2px;">
                                      <el-select
                                      v-model="item.timerWeekValue"
                                      :placeholder="'请选择'"
                                      multiple
                                      style="width: 100%"
                                      @change="weekChange($event, index)"
                                      
                                      :disabled="item.isAdvance == 1"
                                  >
                                      <el-option v-for="subItem in timerWeeks" :key="subItem.value" :label="subItem.label" :value="subItem.value"></el-option>
                                  </el-select>
                                  </el-col>
          
                                  <el-col :span="5" style="padding-top:15px;">
                                      <el-checkbox v-model="item.isAdvance" :true-label="1" :false-label="0" @change="customerCronChange(($event, index))" border  style="width: 100%">
                                          其他Cron表达式
                                      </el-checkbox>
                                  </el-col>
          
                                  <el-col :span="19" style="padding-top:15px;">
                                  <el-input v-model="item.cronExpression" :placeholder="cron执行表达式" :disabled="item.isAdvance == 0" >
                                      <template >
                                          <el-button type="primary" @click="handleShowCron(item, index)" :disabled="item.isAdvance == 0">
                                              生成表达式
                                              <i class="el-icon-time el-icon--right"></i>
                                          </el-button>
                                      </template>
                                  </el-input>
                                  </el-col>
          
          
                              </el-row>
            
                              <div v-if="item.thingsModel">
                                  <!--类型和父级物模型-->
                                  <el-row :gutter="16">
                                      <el-col :span="5">
                                          <el-select v-model="item.type" :placeholder="请选择类型"  @change="handleTriggerTypeChange($event, index)">
                                              <el-option v-for="(subItem, subIndex) in triggerTypes" :key="subIndex + 'type'" :label="subItem.label" :value="subItem.value"></el-option>
                                          </el-select>
                                      </el-col>
            
                                      <el-col :span="10">
                                          <el-select
                                              style="width: 100%"
                                              v-model="item.parentId"
                                              :placeholder="'请选择父级物模型'"
                                              
                                              v-if="item.type == 1"
                                              @change="handleTriggerParentModelChange($event, index)"
                                          >
                                              <el-option v-for="(subItem, subIndex) in item.thingsModel.properties" :key="subIndex + 'triggerProperty'" :label="subItem.name" :value="subItem.id"></el-option>
                                          </el-select>
                                          <el-select
                                              style="width: 100%"
                                              v-model="item.parentId"
                                              :placeholder="'请选择父级物模型'"
                                              
                                              v-else-if="item.type == 2"
                                              @change="handleTriggerParentModelChange($event, index)"
                                          >
                                              <el-option v-for="(subItem, subIndex) in item.thingsModel.functions" :key="subIndex + 'triggerFunc'" :label="subItem.name" :value="subItem.id"></el-option>
                                          </el-select>
                                          <el-select
                                              style="width: 100%"
                                              v-model="item.parentId"
                                              :placeholder="'请选择父级物模型'"
                                              
                                              v-else-if="item.type == 3"
                                              @change="handleTriggerParentModelChange($event, index)"
                                          >
                                              <el-option v-for="(subItem, subIndex) in item.thingsModel.events" :key="subIndex + 'triggerEvents'" :label="subItem.name" :value="subItem.id"></el-option>
                                          </el-select>
                                      </el-col>
                                  </el-row>
            
                                  <!--数组索引/物模型/操作符和值-->
                                  <el-row :gutter="16">
                                      <el-col :span="5" v-if="item.parentModel && item.parentModel.datatype.type === 'array'">
                                          <el-select v-model="item.arrayIndex" :placeholder="'请选择'"  @change="handleTriggerIndexChange($event, index)">
                                              <el-option v-for="subItem in item.parentModel.datatype.arrayModel" :key="subItem.id" :label="subItem.name" :value="subItem.id"></el-option>
                                          </el-select>
                                      </el-col>
                                      <el-col :span="5" v-if="item.parentModel && item.parentModel.datatype.type === 'array' && item.parentModel.datatype.arrayType === 'object'">
                                          <el-select v-model="item.id" :placeholder="'请选择'"  @change="handleTriggerModelChange($event, index)">
                                              <el-option v-for="(subItem, subIndex) in item.parentModel.datatype.params" :key="subIndex" :label="subItem.name" :value="subItem.id"></el-option>
                                          </el-select>
                                      </el-col>
                                      <el-col :span="5" v-if="item.parentModel && item.parentModel.datatype.type === 'object'">
                                          <el-select v-model="item.id" :placeholder="'请选择'"  @change="handleTriggerModelChange($event, index)">
                                              <el-option v-for="(subItem, subIndex) in item.parentModel.datatype.params" :key="subIndex" :label="subItem.name" :value="subItem.id"></el-option>
                                          </el-select>
                                      </el-col>
                                      <el-col :span="5" v-if="item.model && (item.model.datatype.type === 'integer' || item.model.datatype.type === 'decimal' || item.model.datatype.type === 'string')">
                                          <el-select v-model="item.operator" :placeholder="'请选择操作符'" >
                                              <el-option key="=" label="等于（=）" value="=" />
                                              <el-option key="!=" label="不等于（!=）" value="!=" />
                                              <el-option key=">" label="大于（>）" value=">" v-if="item.model.datatype.type === 'integer' || item.model.datatype.type === 'decimal'" />
                                              <el-option key="<" label="小于（<）" value="<" v-if="item.model.datatype.type === 'integer' || item.model.datatype.type === 'decimal'" />
                                              <el-option key=">=" label="大于等于（>=）" value=">=" v-if="item.model.datatype.type === 'integer' || item.model.datatype.type === 'decimal'" />
                                              <el-option key="<=" label="小于等于（<=）" value="<=" v-if="item.model.datatype.type === 'integer' || item.model.datatype.type === 'decimal'" />
                                              <el-option key="between" label="在...之间（between）" value="between" v-if="item.model.datatype.type === 'integer' || item.model.datatype.type === 'decimal'" />
                                              <el-option key="notBetween" label="不在...之间（notBetween）" value="notBetween" v-if="item.model.datatype.type === 'integer' || item.model.datatype.type === 'decimal'" />
                                              <el-option key="contain" label="包含（contain）" value="contain" v-if="item.model.datatype.type === 'string'" />
                                              <el-option key="notContain" label="不包含（notContain）" value="notContain" v-if="item.model.datatype.type === 'string'" />
                                          </el-select>
                                      </el-col>
                                      <el-col :span="9" v-if="item.model">
                                          <div v-if="item.model.datatype.type === 'integer' || item.model.datatype.type === 'decimal'" v-show="item.operator === 'between' || item.operator === 'notBetween'">
                                              <el-input
                                                  style="width: 95px; vertical-align: baseline"
                                                  @input="valueChange($event, item)"
                                                  v-model="item.valueA"
                                                  :placeholder="值"
                                                  :max="item.model.datatype.max"
                                                  :min="item.model.datatype.min"
                                                  type="number"
                                                  
                                              ></el-input>
                                              <span style="padding: 0 3px; color: #999">-</span>
                                              <el-input
                                                  style="width: 165px; vertical-align: baseline"
                                                  @input="valueChange($event, item)"
                                                  v-model="item.valueB"
                                                  :placeholder="值"
                                                  :max="item.model.datatype.max"
                                                  :min="item.model.datatype.min"
                                                  type="number"
                                                  
                                              >
                                                  <template >{{ item.model.datatype.unit }}</template>
                                              </el-input>
                                          </div>
            
                                          <div v-if="item.model.datatype.type === 'integer' || item.model.datatype.type === 'decimal'" v-show="item.operator !== 'between' && item.operator !== 'notBetween'">
                                              <el-input style="vertical-align: baseline" v-model="item.value" :placeholder="值" >
                                                  <template >{{ item.model.datatype.unit }}</template>
                                              </el-input>
                                          </div>
                                          <div v-else-if="item.model.datatype.type === 'bool'">
                                              <el-switch
                                                  style="vertical-align: sub"
                                                  v-model="item.value"
                                                  :active-text="item.model.datatype.trueText"
                                                  :inactive-text="item.model.datatype.falseText"
                                                  active-value="1"
                                                  inactive-value="0"
                                                  size="mini"
                                              ></el-switch>
                                          </div>
                                          <div v-else-if="item.model.datatype.type === 'enum'">
                                              <el-select v-model="item.value" :placeholder="'请选择'" style="width: 100%" >
                                                  <el-option v-for="(subItem, subIndex) in item.model.datatype.enumList" :key="subIndex + 'things'" :label="subItem.text" :value="subItem.value"></el-option>
                                              </el-select>
                                          </div>
                                          <div v-else-if="item.model.datatype.type === 'string'">
                                              <el-input v-model="item.value" :placeholder="'请输入字符串'"  :max="item.model.datatype.maxLength" />
                                          </div>
                                      </el-col>
                                  </el-row>
                              </div>
                          </div>
                          <div v-if="!(form.cond == 3 && formJson.triggers.length > 0)">
                             
                              <a  style="color: #409eff;padding:20px;" @click="handleAddTrigger()">{{ '添加触发器' }}</a>
                          </div>
                      </el-form-item>
                  </div>
            
            




            </el-tab-pane>
            <el-tab-pane :label="'关联执行操作'" name="notify">
     


                

               
  
            
                    <div class="action-wrap">
                      <el-form-item :label="'执行操作'">
                        <span style="margin-left: 0px; font-size: 15px">提示：必须先创建触发器,执行仪器设备的功能调用, </span>
                        <span style="margin-left: 0px; font-size: 15px"></span>
                          <div  class="item-wrap" style="display:none;background-color: #eef3f7;width: 100%;box-shadow: 2px 2px 2px rgba(0, 0, 0, .4), -2px -2px 2px rgba(255, 255, 255, .9);">
                              <el-row :gutter="16">
                                  <el-col :span="8">
                                      <span>
                                          <el-tooltip class="item" effect="dark" :content="'在设定的时间范围内将不再重复执行'" placement="top">
                                              <i class="el-icon-question"></i>
                                          </el-tooltip>
                                          {{  '静默时间：' }}
                                      </span>
                                      <el-input v-model="form.silentPeriod"  :placeholder="分钟" type="number" style="width: 140px">
                                          <template >{{ 分钟 }}</template>
                                      </el-input>
                                  </el-col>
                                  <el-col :span="8">
                                      <span>{{  '执行方式：' }}</span>
                                      <el-select v-model="form.executeMode" :placeholder="'请选择执行方式'"  style="width: 160px">
                                          <el-option key="1" :label="'串行(顺序执行)'" :value="1" />
                                          <el-option key="2" :label="'并行(同时执行)'" :value="2" />
                                      </el-select>
                                  </el-col>
                                  <el-col :span="8">
                                      <span>
                                          <el-tooltip class="item" effect="dark" :content="'延时不会存储，限制为90秒内'" placement="top">
                                              <i class="el-icon-question"></i>
                                          </el-tooltip>
                                          {{ '延时执行：' }}
                                      </span>
                                      <el-input
                                          v-model="form.executeDelay"
                                          
                                          prop="executeDelay"
                                          :placeholder="'秒钟'"
                                          :max="90"
                                          :min="0"
                                          oninput="if(value>90)value=90;if(value<0)value=0"
                                          type="number"
                                          style="width: 140px"
                                      >
                                          <template >{{ '秒钟' }}</template>
                                      </el-input>
                                  </el-col>
                              </el-row>
                          </div>
                  
                          <div class="item-wrap" style="background-color: #eef3f7;width: 100%;box-shadow: 2px 2px 2px rgba(0, 0, 0, .4), -2px -2px 2px rgba(255, 255, 255, .9);" v-for="(item, index) in formJson.actions" :key="index">
                              <el-row :gutter="16">
                                  <el-col :span="5">
                                      <el-select v-model="item.source" :placeholder="'请选择'"  @change="handleActionSourceChange($event, index)">
                                          <el-option v-for="subItem in actionSource" :key="subItem.value" :label="subItem.label" :value="subItem.value"></el-option>
                                      </el-select>
                                  </el-col>
                                  <el-col :span="10" v-if="item.source == 1">
                                      <el-input readonly v-model="item.deviceCount"  :placeholder="'请选择设备'" style="margin-top: 3px">
                                          <template #prepend>
                                            <span>{{ '数量' }}</span>
                                          </template>
                                            <template #append>
                                              <el-button  @click="handleSelectDevice('action', item, index)" >选择设备2</el-button>
                                            </template>
              
                                      </el-input>
                                  </el-col>
                                  <el-col :span="10" v-if="item.source == 3">
                                      <el-input readonly v-model="item.productName"  :placeholder="'请选择产品'" style="margin-top: 3px">
                                          <template #prepend>
                                            <span>{{ '产品名称' }}</span>
                                          </template>
                                            <template #append>
                                              <el-button  @click="handleSelectProduct('action', item, index)" >{{ '选择产品' }}</el-button>
                                            </template>
                                      </el-input>
                                  </el-col>
                                  <el-col :span="10" v-if="item.source == 5">
          
                                      <el-input readonly v-model="item.name"   :placeholder="'请选择恢复告警场景'" style="margin-top: 3px">
                                            <template #append>
                                              <el-button  @click="handleSelectProduct('action', item, index)" >{{ '选择场景' }}</el-button>
                                            </template>
                                      </el-input>
                                  </el-col>
                                  <div class="delete-wrap">
                                      <el-button  v-if="index != 0" plain type="danger" style="padding: 5px" icon="Delete" @click="handleRemoveAction(index)">{{ '删除' }}</el-button>
                                  </div>
                              </el-row>
              
                              <div v-if="item.thingsModel">
                                  <!--类型和父级物模型-->
                                  <el-row :gutter="16">
                                      <el-col :span="5">
                                          <el-select v-model="item.type" :placeholder="是"  @change="handleActionTypeChange($event, index)">
                                              <el-option v-for="(subItem, subIndex) in actionTypes" :key="subIndex + 'type'" :label="subItem.label" :value="subItem.value"></el-option>
                                          </el-select>
                                      </el-col>
                                      <el-col :span="10">
                                          <el-select
                                              style="width: 100%"
                                              v-model="item.parentId"
                                              :placeholder="'请选择父级物模型'"
                                              v-if="item.type == 1"
                                              
                                              @change="handleActionParentModelChange($event, index)"
                                          >
                                              <el-option v-for="(subItem, subIndex) in item.thingsModel.properties" :key="subIndex + 'actionProperty'" :label="subItem.name" :value="subItem.id"></el-option>
                                          </el-select>
                                          <el-select
                                              style="width: 100%"
                                              v-model="item.parentId"
                                              :placeholder="'请选择父级物模型'"
                                              v-else-if="item.type == 2"
                                              
                                              @change="handleActionParentModelChange($event, index)"
                                          >
                                              <el-option v-for="(subItem, subIndex) in item.thingsModel.functions" :key="subIndex + 'actionFunc'" :label="subItem.name" :value="subItem.id"></el-option>
                                          </el-select>
                                      </el-col>
                                  </el-row>
              
                                  <!--数组索引/物模型/值-->
                                  <el-row :gutter="16">
                                      <el-col :span="5" v-if="item.parentModel && item.parentModel.datatype.type === 'array'">
                                          <el-select v-model="item.arrayIndex" :placeholder="'请选择'"  @change="handleActionIndexChange($event, index)">
                                              <el-option v-for="subItem in item.parentModel.datatype.arrayModel" :key="subItem.id" :label="subItem.name" :value="subItem.id"></el-option>
                                          </el-select>
                                      </el-col>
                                      <el-col :span="5" v-if="item.parentModel && item.parentModel.datatype.type === 'array' && item.parentModel.datatype.arrayType === 'object'">
                                          <el-select v-model="item.id" :placeholder="'请选择'"  @change="handleActionModelChange($event, index)">
                                              <el-option v-for="(subItem, subIndex) in item.parentModel.datatype.params" :key="subIndex" :label="subItem.name" :value="subItem.id"></el-option>
                                          </el-select>
                                      </el-col>
                                      <el-col :span="5" v-if="item.parentModel && item.parentModel.datatype.type === 'object'">
                                          <el-select v-model="item.id" :placeholder="'请选择'"  @change="handleActionModelChange($event, index)">
                                              <el-option v-for="(subItem, subIndex) in item.parentModel.datatype.params" :key="subIndex" :label="subItem.name" :value="subItem.id"></el-option>
                                          </el-select>
                                      </el-col>
                                      <el-col :span="10" v-if="item.model">
                                          <div v-if="item.model.datatype.type === 'integer' || item.model.datatype.type === 'decimal'">
                                              <el-input
                                                  style="vertical-align: baseline"
                                                  v-model="item.value"
                                                  :placeholder="值"
                                                  :max="item.model.datatype.max"
                                                  :min="item.model.datatype.min"
                                                  type="number"
                                                  
                                              >
                                                  <template >{{ item.model.datatype.unit }}</template>
                                              </el-input>
                                          </div>
                                          <div v-else-if="item.model.datatype.type === 'bool'">
                                              <el-switch
                                                  style="vertical-align: baseline"
                                                  v-model="item.value"
                                                  :active-text="item.model.datatype.trueText"
                                                  :inactive-text="item.model.datatype.falseText"
                                                  active-value="1"
                                                  inactive-value="0"
                                              ></el-switch>
                                          </div>
                                          <div v-else-if="item.model.datatype.type === 'enum'">
                                              <el-select v-model="item.value" :placeholder="'请选择'" style="width: 100%" >
                                                  <el-option v-for="(subItem, subIndex) in item.model.datatype.enumList" :key="subIndex + 'things'" :label="subItem.text" :value="subItem.value"></el-option>
                                              </el-select>
                                          </div>
                                          <div v-else-if="item.model.datatype.type === 'string'">
                                              <el-input v-model="item.value" :placeholder="'请输入字符串'"  :max="item.model.datatype.maxLength" />
                                          </div>
                                      </el-col>
                                  </el-row>
                              </div>
                          </div>
                          <div>
                              +
                              <a style="color: #409eff" @click="handleAddAction()">{{ '添加执行动作' }}</a>
                          </div>
          
                     
             
                      </el-form-item>
                  </div>
                 
            </el-tab-pane>
            <!-- 用于设置间距 -->

            <el-tab-pane disabled >
                  <template #label>
                    <div style="margin-left: 450px"></div>
                  </template>
            </el-tab-pane>
            <el-tab-pane name="sceneButton" disabled v-if="activeName == 'relateScene'">
                  <template #label>
                    
                  </template>
            </el-tab-pane>
            <el-tab-pane name="notifyButton" disabled v-else>
                <template #label>
               
                  </template>
            </el-tab-pane>
        </el-tabs>




        </el-card >
  
        </el-form>
        <template #footer>
          <div  class="dialog-footer">
              <el-button type="primary" @click="handleSubmitForm" :disabled="updateBtnDisabled" :loading="confirmLoading" v-hasPermi="['iot:scene:edit']" v-show="form.sceneId">{{ '更新' }}</el-button>
              <el-button type="primary" @click="handleSubmitForm" :disabled="updateBtnDisabled" :loading="confirmLoading" v-hasPermi="['iot:scene:add']" v-show="!form.sceneId">{{ '新增' }}</el-button>
              <el-button @click="cancel">{{ '关闭' }}</el-button>
          </div>
  
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup name="Scene">
  
  import { listScene, getScene, delScene, addScene, updateScene} from '@/api/iot/scene';
  import { cacheJsonThingsModel } from '@/api/iot/model';
  
   import deviceListAlert from './device-list';
   import productListAlert from './product-list';
   import sceneListAlert from './scene-list';
  const activeName=ref('relateScene')
  const deviceListRef = ref(null);
  const productListRef = ref(null);
  const sceneListRef = ref(null);
  
  
  const { proxy } = getCurrentInstance()
  
  const sceneList = ref([])
  const open = ref(false)
  const loading = ref(true)
  const showSearch = ref(true)
  const ids = ref([])
  const single = ref(true)
  const multiple = ref(true)
  const total = ref(0)
  const title = ref("")
  
  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      sceneName: null,
      chainName: null,
      enable: null,
      userId: null,
      userName: null,
      silentPeriod: null,
      cond: null,
      executeMode: null,
      executeDelay: null,
      hasAlert: null,
      applicationName: null,
      elData: null,
      terminalUser: null
    },
  
  })
  
  // 表单验证规则
  const rules = reactive({
    sceneName: [
        { required: true, message: '请输入场景名称', trigger: 'blur' },
        { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    enable: [
        { required: true, message: '请选择场景状态', trigger: 'change' }
    ],
    remark: [
        { max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }
    ],
    cond: [
        { required: true, message: '请选择触发条件', trigger: 'change' }
    ],
    silentPeriod: [
        { required: true, message: '请输入静默时间', trigger: 'blur' },
        { type: 'number', message: '静默时间必须为数字值', trigger: 'blur' }
    ],
    executeMode: [
        { required: true, message: '请选择执行方式', trigger: 'change' }
    ],
    executeDelay: [
        { required: true, message: '请输入延时执行时间', trigger: 'blur' },
        { type: 'number', message: '延时执行时间必须为数字值', trigger: 'blur' }
    ]
  })
  
  // 表单数据
  const form = reactive({
    sceneId: null,
    sceneName: '',
    enable: 1,
    remark: '',
    cond: 1,
    silentPeriod: 0,
    executeMode: 1,
    executeDelay: 0,
    createBy: '',
    createTime: '',
    applicationName: 'senbe',
    recoverId: 0,
    checkDelay: 0,

  })
  
  
  // 定义响应式数据
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    sceneName: ''
  })
  
  // 表单JSON数据
  const formJson = reactive({
    triggers: [],
    actions: []
  })
  
  
  
  
  // const open = ref(false)
  // const title = ref('')
  const confirmLoading = ref(false)
  const updateBtnDisabled = ref(false)
  
  // 告警设置
  const alertOpen = ref(false)
  const alertForm = reactive({
    sceneId: null,
    alertLevel: 1,
    alertTitle: '',
    alertContent: '',
    alertTypes: [4],
    alertUserIds: []
  })
  
  const alertRules = reactive({
    alertTitle: [
        { required: true, message: '请输入告警标题', trigger: 'blur' },
        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
    ],
    alertContent: [
        { required: true, message: '请输入告警内容', trigger: 'blur' },
        { min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur' }
    ],
    alertTypes: [
        { type: 'array', required: true, message: '请至少选择一种告警方式', trigger: 'change' }
    ],
    alertUserIds: [
        { type: 'array', required: true, message: '请选择接收人', trigger: 'change' }
    ]
  })
  
  // 设备选择
  const deviceOpen = ref(false)
  const deviceQueryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    deviceName: '',
    status: '',
    productId: ''
  })
  const deviceList = ref([])
  const deviceTotal = ref(0)
  const deviceLoading = ref(false)
  const deviceMultipleSelection = ref([])
  const deviceSelectType = ref('')
  const deviceSelectIndex = ref(0)
  const productOptions = ref([])
  const productTypeOptions = ref({
    0: '普通产品',
    1: '网关产品',
    2: '子设备产品'
  })
  
  // 产品选择
  const productOpen = ref(false)
  const productQueryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    productName: ''
  })
  const productList = ref([])
  const productTotal = ref(0)
  const productLoading = ref(false)
  const productMultipleSelection = ref([])
  const productSelectType = ref('')
  const productSelectIndex = ref(0)
  
  // 恢复告警场景选择
  const recoverScenesOpen = ref(false)
  const recoverScenesQueryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    sceneName: ''
  })
  const recoverScenesList = ref([])
  const recoverScenesTotal = ref(0)
  const recoverScenesLoading = ref(false)
  const recoverScenesSelection = ref(null)
  const recoverScenesSelectIndex = ref(0)
  
  // CRON表达式生成器
  const cronOpen = ref(false)
  const cronForm = reactive({
    cronType: 1,
    frequency: 1,
    minute: '0',
    hour: '0',
    dayOfMonth: '1',
    month: '1',
    dayOfWeek: '1',
    advancedSecond: '0',
    advancedMinute: '0',
    advancedHour: '0',
    advancedDayOfMonth: '*',
    advancedMonth: '*',
    advancedDayOfWeek: '*',
    advancedYear: '',
    cronExpression: '',
    cronDescription: ''
  })
  const cronTriggerIndex = ref(0)
  
  // 日志查询
  const logOpen = ref(false)
  const logQueryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    sceneId: null,
    status: '',
    dateRange: []
  })
  const logList = ref([])
  const logTotal = ref(0)
  const logLoading = ref(false)
  
  // 用户搜索
  const userOptions = ref([])
  const userLoading = ref(false)
  
  // 下拉选项数据
  const triggerSource = ref([
    { value: 1, label: '使用设备触发' }
  ])
  
  const actionSource = ref([
                //   {
                //       value: 1,
                //       label: '设备执行',
                //   },
                //   {
                //       value: 3,
                //       label: '产品执行' ,
                //   },
                  {
                      value: 4,
                      label: '告警执行',
                  },
                 
  ])
  
  const triggerTypes = ref([
    { value: 1, label: '因子' },
    // { value: 2, label: '定时触发' },
    // { value: 3, label: '事件' },
    // { value: 4, label: '设备上线' },
    // { value: 5, label: '设备下线' }
  ])
  
  const actionTypes = ref([
    { value: 1, label: '因子' },
    // { value: 2, label: '功能' }
  ])
  
  const timerWeeks = ref([
    { value: 1, label: '周一' },
    { value: 2, label: '周二' },
    { value: 3, label: '周三' },
    { value: 4, label: '周四' },
    { value: 5, label: '周五' },
    { value: 6, label: '周六' },
    { value: 7, label: '周日' }
  ])
  
  // 表单引用
  const queryFormRef = ref(null)
  const formRef = ref(null)
  const alertFormRef = ref(null)
  const deviceQueryFormRef = ref(null)
  const productQueryFormRef = ref(null)
  const recoverScenesQueryFormRef = ref(null)
  const cronFormRef = ref(null)
  const logQueryFormRef = ref(null)
  const currentType =ref(null)
  const currentIndex =ref(null)
  
  // 生命周期钩子
  onMounted(() => {
    getList()
  
  })
  
  
  // 获取设备列表
  const getDeviceList = () => {
    deviceLoading.value = true
    selectDeviceList(deviceQueryParams).then(response => {
        deviceList.value = response.rows
        deviceTotal.value = response.total
        deviceLoading.value = false
    }).catch(error => {
        deviceLoading.value = false
    })
  }
  
  
  
  // 获取恢复告警场景列表
  const getRecoverScenesList = () => {
    recoverScenesLoading.value = true
    selectRecoverScenesList(recoverScenesQueryParams).then(response => {
        recoverScenesList.value = response.rows
        recoverScenesTotal.value = response.total
        recoverScenesLoading.value = false
    }).catch(error => {
        recoverScenesLoading.value = false
    })
  }
  
  // 获取日志列表
  const getLogList = () => {
    if (logQueryParams.dateRange && logQueryParams.dateRange.length > 0) {
        logQueryParams.beginTime = logQueryParams.dateRange[0]
        logQueryParams.endTime = logQueryParams.dateRange[1]
    } else {
        logQueryParams.beginTime = ''
        logQueryParams.endTime = ''
    }
    
    logLoading.value = true
    selectSceneLogList(logQueryParams).then(response => {
        logList.value = response.rows
        logTotal.value = response.total
        logLoading.value = false
    }).catch(error => {
        logLoading.value = false
    })
  }
  
  // 搜索用户
  const remoteSearchUser = (query) => {
    if (query === '') {
        userOptions.value = []
        return
    }
    
    userLoading.value = true
    selectUserList({ userName: query }).then(response => {
        userOptions.value = response.rows
        userLoading.value = false
    }).catch(error => {
        userLoading.value = false
    })
  }
  
  // 添加场景
  const handleAdd = () => {
     reset()
    confirmLoading.value = false;
    form.enable = 1
    form.cond = 1
    form.silentPeriod = 0
    form.executeMode = 1
    form.executeDelay = 0
    
    formJson.triggers = [
        {
            source: 1,
            type: 1,
            deviceCount: null,
            deviceIds: [],
            productId: '',
            productName: '',
            thingsModel: null,
            parentId: '',
            parentModel: null,
            id: '',
            model: null,
            arrayIndex: '',
            operator: '=',
            value: '',
            valueA: '',
            valueB: '',
            timerTimeValue: '',
            timerWeekValue: [],
            isAdvance: 0,
            cronExpression: ''
        }
    ]
    
    formJson.actions = [
        {
            productId: null,
            productName: "",
            deviceCount: 0,
            source: 4,
            deviceNums: [],
            type: 2,
            id: "",
            name: "",
            value: "",
            parentId: "",
            parentName: "",
            arrayIndex: "",
            arrayIndexName: "",
            scriptPurpose: 3
        }
    ]
    
    title.value = '添加告警场景'
    open.value = true
    nextTick(() => {
        updateBtnDisabled.value = false
    })
  }
  
  // 修改场景
  const handleUpdate = (row) => {
      confirmLoading.value = false;
    proxy.resetForm(form)
    proxy.resetForm(formJson)
    const sceneId = row.sceneId || ids;
    getScene(sceneId).then((response) => {
             //     form.value = response.data;
                  Object.assign(form, response.data)
                  // triggers赋值
                  formJson.triggers = form.triggers;
                  
                  for (let i = 0; i < formJson.triggers.length; i++) {
                      debugger
                      // 定时
                      if (formJson.triggers[i].source == 2) {
                          if (formJson.triggers[i].isAdvance == 0) {
                              let arrayValue = formJson.triggers[i].cronExpression.substring(12).split(',').map(Number);
                              formJson.triggers[i].timerWeekValue = arrayValue;
                              let timerTimeValue = formJson.triggers[i].cronExpression.substring(5, 7) + ':' + formJson.triggers[i].cronExpression.substring(2, 4);
                              // 解决时间选择器不能编辑问题
                              $set(formJson.triggers[i], 'timerTimeValue', timerTimeValue);
                          }
                      } else if (formJson.triggers[i].source == 4) {
                      } else {
                          // 获取设备和物模型详情
                          formatSceneScript(formJson.triggers[i], i);
                      }
                  }
                  // actions赋值
                  formJson.actions = form.actions;
                 
                 
                  for (let i = 0; i < formJson.actions.length; i++) {
                      // 获取设备和物模型详情
                      formatSceneScript(formJson.actions[i], i);
                  }
                  updateBtnDisabled.value = false;
                  open.value = true;
                  title.value = '修改告警场景';
              });
  }
  
  
          /**
           * 格式化显示场景脚本（触发器和执行动作）
           * sceneScript:触发器或动作
           * sceneScript.scriptPurpose：脚本用途(1=数据流，2=触发器，3=执行动作)
           */
           function   formatSceneScript(sceneScript, index) {
              if (sceneScript.scriptPurpose == 2) {
                  // 获取物模型
                  cacheJsonThingsModel(sceneScript.productId).then((response) => {
                      let data = JSON.parse(response.data);
                      sceneScript.thingsModel = formatArrayIndex(data);
                      // value赋值，value=valueA-valueB
                      if (sceneScript.value.indexOf('-') != -1) {
                          let values = sceneScript.value.split('-');
                          sceneScript.valueA = values[0];
                          sceneScript.valueB = values[1];
                      }
                      let sceneScripts = [];
                      if (sceneScript.type == 1) {
                          // 因子
                          sceneScripts = sceneScript.thingsModel.properties;
                      } else if (sceneScript.type == 2) {
                          // 功能
                          sceneScripts = sceneScript.thingsModel.functions;
                      } else if (sceneScript.type == 3) {
                          // 事件
                          sceneScripts = sceneScript.thingsModel.events;
                      }
                      // 父级物模型和物模型赋值
                      setParentAndModelData(sceneScript, sceneScripts);
                
                  });
              } else if (sceneScript.scriptPurpose == 3) {
                  // 执行告警，没有物模型
                  if (sceneScript.source == 4 || sceneScript.source == 5) {
                      return;
                  }
                  // 获取物模型
                  cacheJsonThingsModel(sceneScript.productId).then((response) => {
                      let data = JSON.parse(response.data);
                      sceneScript.thingsModel = formatArrayIndex(data);
                      // 过滤监测数据和只读数据
                      if (sceneScript.thingsModel.properties) {
                          sceneScript.thingsModel.properties = sceneScript.thingsModel.properties.filter((item) => item.isMonitor == 0 && item.isReadonly == 0);
                          for (let i = 0; i < sceneScript.thingsModel.properties.length; i++) {
                              if (sceneScript.thingsModel.properties[i].datatype.params) {
                                  sceneScript.thingsModel.properties[i].datatype.params = sceneScript.thingsModel.properties[i].datatype.params.filter((item) => item.isReadonly == 0);
                              }
                          }
                      }
                      if (sceneScript.thingsModel.functions) {
                          sceneScript.thingsModel.functions = sceneScript.thingsModel.functions.filter((item) => item.isReadonly == 0);
                          for (let i = 0; i < sceneScript.thingsModel.functions.length; i++) {
                              if (sceneScript.thingsModel.functions[i].datatype.params) {
                                  sceneScript.thingsModel.functions[i].datatype.params = sceneScript.thingsModel.functions[i].datatype.params.filter((item) => item.isReadonly == 0);
                              }
                          }
                      }
  
                      let sceneScripts = [];
                      if (sceneScript.type == 1) {
                          // 因子
                          sceneScripts = sceneScript.thingsModel.properties;
                      } else if (sceneScript.type == 2) {
                          // 功能
                          sceneScripts = sceneScript.thingsModel.functions;
                      }
                      // 父级物模型和物模型赋值
                      setParentAndModelData(sceneScript, sceneScripts);
                      // // 解决数组在界面中不更新问题
                      // $set(formJson.actions, index, formJson.actions[index]);
                  });
              }
          }
  
  
                  // 设置父级物模型和物模型值
               function  setParentAndModelData (sceneScript, sceneScripts) {
              for (let i = 0; i < sceneScripts.length; i++) {
                  if (sceneScript.parentId == sceneScripts[i].id) {
                      sceneScript.parentModel = sceneScripts[i];
                      if (sceneScript.parentModel.datatype.type === 'object') {
                          // 对象类型，物模型赋值
                          for (let j = 0; j < sceneScript.parentModel.datatype.params.length; j++) {
                              if (sceneScript.id == sceneScript.parentModel.datatype.params[j].id) {
                                  sceneScript.model = sceneScript.parentModel.datatype.params[j];
                              }
                          }
                      } else if (sceneScript.parentModel.datatype.arrayType === 'object' && sceneScript.parentModel.datatype.type === 'array') {
                          // 对象数组类型，物模型集合移除索引前缀
                          if (sceneScript.id.indexOf('array_') != -1) {
                              sceneScript.id = sceneScript.id.substring(9);
                          }
                          // 物模型赋值
                          for (let j = 0; j < sceneScript.parentModel.datatype.params.length; j++) {
                              if (sceneScript.id == sceneScript.parentModel.datatype.params[j].id) {
                                  sceneScript.model = sceneScript.parentModel.datatype.params[j];
                              }
                          }
                      } else if (sceneScript.parentModel.datatype.arrayType !== 'object' && sceneScript.parentModel.datatype.type === 'array') {
                          // 普通数组类型，物模型集合移除索引前缀
                          if (sceneScript.id.indexOf('array_') != -1) {
                              sceneScript.id = sceneScript.id.substring(9);
                          }
                          sceneScript.model = {
                              datatype: {
                                  type: sceneScript.parentModel.datatype.arrayType,
                                  maxLength: -1,
                                  min: -1,
                                  max: -1,
                                  unit: '无单位',
                              },
                          };
                      } else {
                          // 普通类型
                          sceneScript.model = sceneScript.parentModel;
                      }
                      break;
                  }
              }
          }
  
   // 删除按钮操作 
    function handleDelete(row) {
            const sceneIds = row.sceneId || this.ids;
    proxy.$modal.confirm('是否确认删除设备告警:'+row.sceneName).then(function() {
      return delScene(sceneIds)
    }).then(() => {
      getList()
      proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {})
  
            };




  // 查看日志
  const handleLog = (row) => {
    logQueryParams.sceneId = row.sceneId
    getLogList()
    logOpen.value = true
  }
  
  // 提交表单
  const handleSubmitForm = () => {
  
  
      
      formRef.value.validate((valid) => {
        if (valid) {
         confirmLoading.value = true
            
            let triggers = [];
            let actions = [];
       // 触发器验证和构建
       for (let i = 0; i < formJson.triggers.length; i++) {
         
                          // 类型为因子/功能/事件
                          if (formJson.triggers[i].type == 1 || formJson.triggers[i].type == 2 || formJson.triggers[i].type == 3) {
                              // 值不能为空
                              if (formJson.triggers[i].source == 1) {
                                  if (formJson.triggers[i].value == '') {
                                         confirmLoading.value = false;
              
                                         proxy.$modal.alertError('触发器中的选项和值不能为空');
                                         return;
                                  } else if (formJson.triggers[i].value.indexOf('-') != -1) {
                                      // 区间格式10-50
                                      if (formJson.triggers[i].valueA == '' || formJson.triggers[i].valueB == '') {
                                         confirmLoading.value = false;
              
                                         proxy.$modal.alertError('触发器中区间值不能为空');
                                         return;
                                      }
                                  }
                              }
                              // 定时时间不能为空
                              if (formJson.triggers[i].source == 2) {
                                  if (formJson.triggers[i].isAdvance == 0) {
                                      if (formJson.triggers[i].timerTimeValue == '' || formJson.triggers[i].timerTimeValue == null) {
                      confirmLoading.value = false;
              
                                        proxy.$modal.alertError('执行时间不能空');
                                          return;
                                      }
                                      if (formJson.triggers[i].timerWeekValue == null || formJson.triggers[i].timerWeekValue == '') {
                   confirmLoading.value = false;
              
                                        proxy.$modal.alertError('请选择要执行的星期');
                                          return;
                                      }
                                  } else if (formJson.triggers[i].isAdvance == 1) {
                                      if (formJson.triggers[i].cronExpression == '') {
                   confirmLoading.value = false;
              
                                        proxy.$modal.alertError('cron表达式不能为空');
                                          return;
                                      }
                                  }
                              }
                          }
                          // 数据重组
                          let item = formJson.triggers[i];
                          // id拼接array索引
                          if (item.arrayIndex != '') {
                              item.id = 'array_' + item.arrayIndex + '_' + item.id;
                          }
                          // 只传需要的数据
                          triggers[i] = {
                              productId: item.productId,
                              productName: item.productName,
                              deviceNums: item.deviceNums,
                              deviceCount: item.deviceCount,
                              source: item.source,
                              type: item.type,
                              id: item.id,
                              name: item.name,
                              operator: item.operator,
                              value: item.value,
                              isAdvance: item.isAdvance,
                              cronExpression: item.cronExpression,
                              parentId: item.parentId,
                              parentName: item.parentName,
                              arrayIndex: item.arrayIndex,
                              arrayIndexName: item.arrayIndexName,
                              scriptPurpose: 2, // scriptPurpose:脚本用途(1=数据流，2=触发器，3=执行动作)
                          };
                      }
  
  
                 // 动作验证和构建
                 for (let i = 0; i < formJson.actions.length; i++) {
                  
                          if (formJson.actions[i].value === '' && formJson.actions[i].source !== 4 && formJson.actions[i].source !== 5) {
                   confirmLoading.value = false;
              
                            proxy.$modal.alertError('执行动作中的选项和值不能为空');
                              return;
                          }
                          // 数据重组
                          let item = formJson.actions[i];
                          // id拼接array索引
                          if (item.arrayIndex != '') {
                              item.id = 'array_' + item.arrayIndex + '_' + item.id;
                          }
                          // 只传需要的数据
                          actions[i] = {
                              productId: item.productId,
                              productName: item.productName,
                              deviceCount: 0,
                              deviceNums : [],
                              source: item.source,
                              type: item.type,
                              id: item.id,
                              name: item.name,
                              value: item.value,
                              parentId: item.parentId,
                              parentName: item.parentName,
                              arrayIndex: item.arrayIndex,
                              arrayIndexName: item.arrayIndexName,
                              scriptPurpose: 3, // scriptPurpose:脚本用途(1=数据流，2=触发器，3=执行动作)
                         
                          };
                      }
                      // 判断是否包含告警(1=包含，2=不包含)
                      if (actions.filter((x) => x.source === 4).length > 0) {
                          form.hasAlert = 1;
                      } else {
                          form.hasAlert = 2;
                      }
                      form.triggers = triggers;
                      form.actions = actions;
                      debugger
                      confirmLoading.value = true;
                      if (form.sceneId != null) {
                        debugger
                          updateScene(form).then(() => {
                              proxy.$modal.msgSuccess('修改成功');
                              open.value = false;
                              confirmLoading.value = false;
                              getList();
                          });
                      } else {
                          
                          addScene(form).then(() => {
                              proxy.$modal.msgSuccess('新增成功');
                              open.value = false;
                              confirmLoading.value = false;
                              getList();
                          });
                      }
                      
                      
        } 
    })
}
  
  // 关闭表单
  const handleClose = () => {
    open.value = false
    nextTick(() => {
        proxy.resetForm(form)
        proxy.resetForm(formJson)
    })
  }
  
  // 打开告警设置
  const handleAlertOpen = () => {
    alertForm.sceneId = form.sceneId
    alertOpen.value = true
  }
  
  // 提交告警设置
  const handleAlertSubmit = () => {
    alertFormRef.value.validate((valid) => {
        if (valid) {
            // 这里处理告警设置的提交逻辑
            alertOpen.value = false
            ElMessage({
                type: 'success',
                message: '告警设置成功!'
            })
        } else {
            return false
        }
    })
  }
  
  // 关闭告警设置
  const handleAlertClose = () => {
    alertOpen.value = false
    proxy.resetForm(alertForm)
  }
  
  // 打开设备选择
  const handleSelectDevice = (type, item, index) => {
      currentType.value = type;
      currentIndex.value = index;
    deviceSelectType.value = type
    deviceSelectIndex.value = index
    
    if (type === 'trigger') {
        deviceQueryParams.productId = item.productId || ''
    } else if (type === 'action') {
        deviceQueryParams.productId = item.productId || ''
    }
    
    deviceMultipleSelection.value = []
  
    
    deviceListRef.value.openDeviceList = true;
    deviceListRef.value.getList();
  
  }
  
  // 设备选择确认
  const handleDeviceConfirm = () => {
    if (deviceMultipleSelection.value.length === 0) {
        ElMessage({
            type: 'warning',
            message: '请选择设备!'
        })
        return
    }
    
    const selectedDevices = deviceMultipleSelection.value
    const deviceIds = selectedDevices.map(device => device.deviceId)
    const deviceNames = selectedDevices.map(device => device.deviceName).join(',')
    
    if (deviceSelectType.value === 'trigger') {
        const triggerItem = formJson.triggers[deviceSelectIndex.value]
        triggerItem.deviceCount = deviceIds.length
        triggerItem.deviceIds = deviceIds
        triggerItem.deviceNames = deviceNames
        if (selectedDevices.length > 0) {
            triggerItem.productId = selectedDevices[0].productId
            triggerItem.productName = selectedDevices[0].productName
        }
    } else if (deviceSelectType.value === 'action') {
        const actionItem = formJson.actions[deviceSelectIndex.value]
        actionItem.deviceCount = deviceIds.length
        actionItem.deviceIds = deviceIds
        actionItem.deviceNames = deviceNames
        if (selectedDevices.length > 0) {
            actionItem.productId = selectedDevices[0].productId
            actionItem.productName = selectedDevices[0].productName
        }
    }
    
    deviceOpen.value = false
  }
  
  // 关闭设备选择
  const handleDeviceClose = () => {
    deviceOpen.value = false
    proxy.resetForm(deviceQueryParams)
    deviceMultipleSelection.value = []
  }
  
  // 打开产品选择
  const handleSelectProduct = (type, item, index) => {
    
      currentType.value = type;
      currentIndex.value = index;
    deviceSelectType.value = type
    deviceSelectIndex.value = index
    
              // 刷新子组建
              productListRef.value.queryParams.pageNum = 1;
              productListRef.value.open = true;
              productListRef.value.selectProductId = item.productId;
              productListRef.value.getList();
  }
  
  // 产品选择确认
  const handleProductConfirm = () => {
    if (productMultipleSelection.value.length === 0) {
        ElMessage({
            type: 'warning',
            message: '请选择产品!'
        })
        return
    }
    
    const selectedProduct = productMultipleSelection.value[0]
    
    if (productSelectType.value === 'trigger') {
        const triggerItem = formJson.triggers[productSelectIndex.value]
        triggerItem.productId = selectedProduct.productId
        triggerItem.productName = selectedProduct.productName
        triggerItem.deviceCount = null
        triggerItem.deviceIds = []
        triggerItem.deviceNames = ''
        triggerItem.thingsModel = null
        triggerItem.parentId = ''
        triggerItem.parentModel = null
        triggerItem.id = ''
        triggerItem.model = null
    } else if (productSelectType.value === 'action') {
        const actionItem = formJson.actions[productSelectIndex.value]
        actionItem.productId = selectedProduct.productId
        actionItem.productName = selectedProduct.productName
        actionItem.deviceCount = null
        actionItem.deviceIds = []
        actionItem.deviceNames = ''
        actionItem.thingsModel = null
        actionItem.parentId = ''
        actionItem.parentModel = null
        actionItem.id = ''
        actionItem.model = null
    }
    
    productOpen.value = false
  }
  
  // 关闭产品选择
  const handleProductClose = () => {
    productOpen.value = false
    proxy.resetForm(productQueryParams)
    productMultipleSelection.value = []
  }
  
  // 打开恢复告警场景选择
  const handleSelectRecoverScenes = (type, item, index) => {
    recoverScenesSelectIndex.value = index
    recoverScenesSelection.value = null
    getRecoverScenesList()
    recoverScenesOpen.value = true
  }
  
  // 恢复告警场景选择确认
  const handleRecoverScenesConfirm = () => {
    if (!recoverScenesSelection.value) {
        ElMessage({
            type: 'warning',
            message: '请选择恢复告警场景!'
        })
        return
    }
    
    const selectedScene = recoverScenesSelection.value
    
    const actionItem = formJson.actions[recoverScenesSelectIndex.value]
    actionItem.source = 5
    actionItem.id = selectedScene.sceneId
    actionItem.name = selectedScene.sceneName
    
    recoverScenesOpen.value = false
  }
  
  // 关闭恢复告警场景选择
  const handleRecoverScenesClose = () => {
    recoverScenesOpen.value = false
    proxy.resetForm(recoverScenesQueryParams)
    recoverScenesSelection.value = null
  }
  
  // 打开CRON表达式生成器
  const handleShowCron = (item, index) => {
    cronTriggerIndex.value = index
    
    // 初始化CRON表单
    proxy.resetForm(cronForm)
    cronForm.cronType = 1
    cronForm.frequency = 1
    
    if (item.cronExpression) {
        cronForm.cronExpression = item.cronExpression
        // 这里可以根据已有表达式解析并填充表单
    }
    
    cronOpen.value = true
  }
  
  // 确认CRON表达式
  const handleCronConfirm = () => {
    const triggerItem = formJson.triggers[cronTriggerIndex.value]
    triggerItem.cronExpression = cronForm.cronExpression
    
    cronOpen.value = false
  }
  
  // 关闭CRON表达式生成器
  const handleCronClose = () => {
    cronOpen.value = false
  }
  
  // 处理触发器源变更
  const handleTriggerSourceChange = (source, index) => {
    const item = formJson.triggers[index]
    item.type = 1
    item.parentId = ''
    item.parentModel = null
    item.id = ''
    item.model = null
    item.operator = '='
    item.value = ''
    item.valueA = ''
    item.valueB = ''
    
    if (source === 1) {
        // 设备
        item.deviceCount = null
        item.deviceIds = []
        item.productId = ''
        item.productName = ''
        item.thingsModel = null
    } else if (source === 2) {
        // 定时
        item.timerTimeValue = ''
        item.timerWeekValue = []
        item.isAdvance = 0
        item.cronExpression = ''
    } else if (source === 3) {
        // 产品
        item.productId = ''
        item.productName = ''
        item.thingsModel = null
    } else if (source === 4) {
        // API
        item.id = ''
        item.value = '{}'
    }
  }
  
  // 处理动作源变更
  const handleActionSourceChange = (source, index) => {
    const item = formJson.actions[index]
    item.type = 1
    item.parentId = ''
    item.parentModel = null
    item.id = ''
    item.model = null
    item.value = ''
    
    if (source === 1) {
        // 设备
        item.deviceCount = null
        item.deviceIds = []
        item.productId = ''
        item.productName = ''
        item.thingsModel = null
    } else if (source === 2) {
        // 告警
        handleAlertOpen()
    } else if (source === 3) {
        // 产品
        item.productId = ''
        item.productName = ''
        item.thingsModel = null
    } else if (source === 4) {
        // API
        item.id = ''
        item.value = '{}'
    } else if (source === 5) {
        // 恢复告警场景
        item.id = ''
        item.name = ''
    }
  }
  
  // 添加触发器
  const handleAddTrigger = () => {
    if (form.cond === 3 && formJson.triggers.length > 0) {
        ElMessage({
            type: 'warning',
            message: '条件为"全部不满足"时只能有一个触发器!'
        })
        return
    }
    
    formJson.triggers.push({
        source: 1,
        type: 1,
        deviceCount: null,
        deviceIds: [],
        productId: '',
        productName: '',
        thingsModel: null,
        parentId: '',
        parentModel: null,
        id: '',
        model: null,
        arrayIndex: '',
        operator: '=',
        value: '',
        valueA: '',
        valueB: '',
        timerTimeValue: '',
        timerWeekValue: [],
        isAdvance: 0,
        cronExpression: ''
    })
  }
  
  // 移除触发器
  const handleRemoveTrigger = (index) => {
    formJson.triggers.splice(index, 1)
  }
  
  // 添加动作
  const handleAddAction = () => {
    formJson.actions.push({
        productId: null,
            productName: "",
            deviceCount: 0,
            source: 4,
            deviceNums: [],
            type: 2,
            id: "",
            name: "",
            value: "",
            parentId: "",
            parentName: "",
            arrayIndex: "",
            arrayIndexName: "",
            scriptPurpose: 3
    })
  }
  
  // 移除动作
  const handleRemoveAction = (index) => {
    formJson.actions.splice(index, 1)
  }
  
  // 时间变更
  const timeChange = (value, index) => {
    const item = formJson.triggers[index]
    item.timerTimeValue = value
  }
  
  // 星期变更
  const weekChange = (value, index) => {
    const item = formJson.triggers[index]
    item.timerWeekValue = value
  }
  
  // 自定义CRON变更
  const customerCronChange = (value, index) => {
    const item = formJson.triggers[index]
    item.isAdvance = value
  }
  
  // 值变更
  const valueChange = (value, item) => {
    // 限制值的范围
    if (item.model && item.model.datatype) {
        if (item.model.datatype.type === 'integer' || item.model.datatype.type === 'decimal') {
            if (item.model.datatype.min !== undefined && parseFloat(value) < parseFloat(item.model.datatype.min)) {
                item.value = item.model.datatype.min
            } else if (item.model.datatype.max !== undefined && parseFloat(value) > parseFloat(item.model.datatype.max)) {
                item.value = item.model.datatype.max
            } else {
                item.value = value
            }
        }
    }
  }
  
  // 重置查询条件
  const handleResetQuery = () => {
    proxy.resetForm(queryParams)
    getList()
  }
  
  // 重置设备查询条件
  const handleResetDeviceQuery = () => {
    proxy.resetForm(deviceQueryParams)
    getDeviceList()
  }
  
  // 重置产品查询条件
  const handleResetProductQuery = () => {
    proxy.resetForm(productQueryParams)
  
  }
  
  // 重置恢复告警场景查询条件
  const handleResetRecoverScenesQuery = () => {
    proxy.resetForm(recoverScenesQueryParams)
    getRecoverScenesList()
  }
  
  // 处理设备表格选择项变更
  const handleDeviceSelectionChange = (val) => {
    deviceMultipleSelection.value = val
  }
  
  // 处理产品表格选择项变更
  const handleProductSelectionChange = (val) => {
    productMultipleSelection.value = val
  }
  
  // 处理恢复告警场景表格选择项变更
  const handleRecoverScenesSelectionChange = (val) => {
    recoverScenesSelection.value = val[0] || null
  }
  
  // 监听触发条件变更
  watch(() => form.cond, (newVal) => {
    if (newVal === 3 && formJson.triggers.length > 1) {
        ElMessage({
            type: 'warning',
            message: '条件为"全部不满足"时只能有一个触发器!'
        })
        // 保留第一个触发器，移除其他
        formJson.triggers = [formJson.triggers[0]]
    }
  })
  
  // 监听告警方式变更
  watch(() => alertForm.alertTypes, (newVal) => {
    if (newVal.includes(2) && !alertForm.alertUserIds.some(userId => userId === 'admin')) {
        // 如果选择了邮件告警但没有选择管理员，则自动添加管理员
        alertForm.alertUserIds.push('admin')
    }
  })
  
  // 监听表单数据变化，禁用更新按钮
  watch([() => form.sceneName, () => form.cond, () => form.silentPeriod, () => form.executeMode, () => form.executeDelay], () => {
    if (open.value) {
        updateBtnDisabled.value = false
    }
  })
  
  // 监听表单JSON数据变化，禁用更新按钮
  watch(() => JSON.stringify(formJson), () => {
    if (open.value) {
        updateBtnDisabled.value = false
    }
  })
  
  // 监听CRON表单变化，生成表达式
  watch([
    () => cronForm.cronType,
    () => cronForm.frequency,
    () => cronForm.minute,
    () => cronForm.hour,
    () => cronForm.dayOfMonth,
    () => cronForm.month,
    () => cronForm.dayOfWeek,
    () => cronForm.advancedSecond,
    () => cronForm.advancedMinute,
    () => cronForm.advancedHour,
    () => cronForm.advancedDayOfMonth,
    () => cronForm.advancedMonth,
    () => cronForm.advancedDayOfWeek,
    () => cronForm.advancedYear
  ], () => {
    // 生成CRON表达式
    if (cronForm.cronType === 1) {
        // 基本表达式
        switch (cronForm.frequency) {
            case 1:
                cronForm.cronExpression = '* * * * *'
                cronForm.cronDescription = '每分钟执行一次'
                break
            case 2:
                cronForm.cronExpression = `${cronForm.minute} * * * *`
                cronForm.cronDescription = `每小时的第${cronForm.minute}分钟执行一次`
                break
            case 3:
                cronForm.cronExpression = `${cronForm.minute} ${cronForm.hour} * * *`
                cronForm.cronDescription = `每天${cronForm.hour}:${cronForm.minute}执行一次`
                break
            case 4:
                cronForm.cronExpression = `${cronForm.minute} ${cronForm.hour} * * ${cronForm.dayOfWeek}`
                cronForm.cronDescription = `每周${cronForm.dayOfWeek} ${cronForm.hour}:${cronForm.minute}执行一次`
                break
            case 5:
                cronForm.cronExpression = `${cronForm.minute} ${cronForm.hour} ${cronForm.dayOfMonth} * *`
                cronForm.cronDescription = `每月${cronForm.dayOfMonth}日 ${cronForm.hour}:${cronForm.minute}执行一次`
                break
            case 6:
                cronForm.cronExpression = `${cronForm.minute} ${cronForm.hour} ${cronForm.dayOfMonth} ${cronForm.month} *`
                cronForm.cronDescription = `每年${cronForm.month}月${cronForm.dayOfMonth}日 ${cronForm.hour}:${cronForm.minute}执行一次`
                break
            case 7:
                cronForm.cronExpression = `${cronForm.minute} ${cronForm.hour} ${cronForm.dayOfMonth} ${cronForm.month} ${cronForm.dayOfWeek}`
                cronForm.cronDescription = '自定义表达式'
                break
        }
    } else {
        // 高级表达式
        cronForm.cronExpression = `${cronForm.advancedSecond} ${cronForm.advancedMinute} ${cronForm.advancedHour} ${cronForm.advancedDayOfMonth} ${cronForm.advancedMonth} ${cronForm.advancedDayOfWeek} ${cronForm.advancedYear || ''}`.trim()
        cronForm.cronDescription = '高级表达式'
    }
  }, { immediate: true })
  
  
  
  /** 查询场景联动列表 */
  function getList() {
    loading.value = true
    listScene(queryParams).then(response => {
      sceneList.value = response.rows
      total.value = response.total
      loading.value = false
    })
  }
  
  // 取消按钮
  function cancel() {
    open.value = false
    reset()
  }
  
  // 表单重置
  function reset() {
    form.value = {
      sceneId: null,
      sceneName: null,
      chainName: null,
      enable: null,
      userId: null,
      userName: null,
      silentPeriod: null,
      cond: null,
      executeMode: null,
      executeDelay: null,
      hasAlert: null,
      applicationName: null,
      elData: null,
      createBy: null,
      createTime: null,
      updateBy: null,
      updateTime: null,
      remark: null,
      terminalUser: null
    }
    
    // 重置formJson数据
    formJson.triggers = []
    formJson.actions = []
    
    proxy.resetForm("formRef"); // 匹配模板中的 ref
  }
  
  /** 搜索按钮操作 */
  function handleQuery() {
    queryParams.pageNum = 1
    getList()
  }
  
  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef")
    handleQuery()
  }
  
  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.sceneId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }
  
  
  
   // 动作物模型项改变事件
   function handleActionParentModelChange(identifier, index) {
              formJson.actions[index].model = null;
              formJson.actions[index].value = '';
              formJson.actions[index].arrayIndex = '';
              formJson.actions[index].arrayIndexName = '';
  
              let sceneScripts = [];
              if (formJson.actions[index].type == 1) {
                  //因子
                  sceneScripts = formJson.actions[index].thingsModel.properties;
              } else if (formJson.actions[index].type == 2) {
                  //功能
                  sceneScripts = formJson.actions[index].thingsModel.functions;
              }
              for (let i = 0; i < sceneScripts.length; i++) {
                  if (sceneScripts[i].id == identifier) {
                      formJson.actions[index].parentName = sceneScripts[i].name;
                      formJson.actions[index].parentModel = sceneScripts[i];
                      if (sceneScripts[i].datatype.type === 'object') {
                          // 对象类型
                          formJson.actions[index].id = '';
                          formJson.actions[index].name = '';
                      } else if (sceneScripts[i].datatype.type === 'array' && sceneScripts[i].datatype.arrayType === 'object') {
                          // 对象数组类型
                          formJson.actions[index].id = '';
                          formJson.actions[index].name = '';
                      } else if (sceneScripts[i].datatype.type === 'array' && sceneScripts[i].datatype.arrayType !== 'object') {
                          // 普通类型，数组类
                          formJson.actions[index].id = sceneScripts[i].id;
                          formJson.actions[index].name = sceneScripts[i].name;
                          // 用于减少界面判断
                          formJson.actions[index].model = {
                              datatype: {
                                  type: formJson.actions[index].parentModel.datatype.arrayType,
                                  maxLength: -1,
                                  min: -1,
                                  max: -1,
                                  unit: '',
                              },
                          };
                      } else {
                          // 普通类型,不包含数组类型
                          formJson.actions[index].id = sceneScripts[i].id;
                          formJson.actions[index].name = sceneScripts[i].name;
                          formJson.actions[index].model = sceneScripts[i];
                      }
                      break;
                  }
              }
          }
     // 触发器源改变事件
    function  handleTriggerSource(source, index) {
              formJson.triggers[index].deviceCount = null;
              formJson.triggers[index].productId = '';
              formJson.triggers[index].productName = '';
              formJson.triggers[index].thingsModel = null;
              formJson.triggers[index].id = '';
              formJson.triggers[index].name = '';
              formJson.triggers[index].value = '';
              formJson.triggers[index].valueA = '';
              formJson.triggers[index].valueB = '';
              formJson.triggers[index].parentId = '';
              formJson.triggers[index].parentName = '';
              formJson.triggers[index].model = null;
              formJson.triggers[index].parentModel = null;
              formJson.triggers[index].operator = '';
              formJson.triggers[index].deviceNums = [];
              // 定时
              formJson.triggers[index].timerTimeValue = ''; // 时间
              formJson.triggers[index].timerWeekValue = [1, 2, 3, 4, 5, 6, 7]; // 星期
          }
   
          function  getSceneData(data) {
             formJson.actions[index].id = data.sceneId;
             formJson.actions[index].name = data.sceneName;
          }
          /**获取选中的产品或设备
           * type 1=设备集合，2=产品
           */
           function   getSelectProduct(data) {
              const type = 2;
              const index = currentIndex.value;
              if (currentType.value == null) {
                  return;
              }
              if (currentType.value == 'trigger') {
                  if (type == 1) {
                      formJson.triggers[index].deviceNums = data.deviceNums;
                      formJson.triggers[index].deviceCount = data.deviceNums.length;
                      formJson.triggers[index].productId = data.productId;
                      formJson.triggers[index].productName = data.productName;
                  } else if (type == 2) {
                      formJson.triggers[index].deviceNums = [];
                      formJson.triggers[index].deviceCount = 0;
                      formJson.triggers[index].productId = data.productId;
                      formJson.triggers[index].productName = data.productName;
                  }
  
                  // 获取物模型
                  cacheJsonThingsModel(data.productId).then((response) => {
                      let data = JSON.parse(response.data);
                      formJson.triggers[index].thingsModel = formatArrayIndex(data);
                      // 清楚之前数据
                      formJson.triggers[index].type = 1;
                      formJson.triggers[index].parentId = '';
                      formJson.triggers[index].parentName = '';
                      formJson.triggers[index].parentModel = null;
                      formJson.triggers[index].model = null;
                      formJson.triggers[index].operator = '';
                      formJson.triggers[index].id = '';
                      formJson.triggers[index].name = '';
                      formJson.triggers[index].value = '';
                      formJson.triggers[index].arrayIndex = '';
                      formJson.triggers[index].arrayIndexName = '';
                 
  
                  });
              } else if (currentType == 'action') {
                  if (type == 1) {
                      formJson.actions[index].deviceNums = data.deviceNums;
                      formJson.actions[index].deviceCount = data.deviceNums.length;
                      formJson.actions[index].productId = data.productId;
                      formJson.actions[index].productName = data.productName;
                  } else if (type == 2) {
                      formJson.actions[index].deviceNums = [];
                      formJson.actions[index].deviceCount = 0;
                      formJson.actions[index].productId = data.productId;
                      formJson.actions[index].productName = data.productName;
                  }
  
                  // 获取物模型
                  cacheJsonThingsModel(data.productId).then((response) => {
                      let data = JSON.parse(response.data);
                      formJson.actions[index].thingsModel = formatArrayIndex(data);
                      // 清楚之前数据
                      formJson.actions[index].type = 1;
                      formJson.actions[index].parentId = '';
                      formJson.actions[index].parentModel = null;
                      formJson.actions[index].parentName = '';
                      formJson.actions[index].model = null;
                      formJson.actions[index].operator = '';
                      formJson.actions[index].id = '';
                      formJson.actions[index].name = '';
                      formJson.actions[index].value = '';
                      formJson.actions[index].arrayIndex = '';
                      formJson.actions[index].arrayIndexName = '';
                      // 过滤监测数据和只读数据
                      if (formJson.actions[index].thingsModel.properties) {
                          formJson.actions[index].thingsModel.properties = formJson.actions[index].thingsModel.properties.filter((item) => item.isMonitor == 0 && item.isReadonly == 0);
                          for (let i = 0; i < formJson.actions[index].thingsModel.properties.length; i++) {
                              if (formJson.actions[index].thingsModel.properties[i].datatype.params) {
                                  formJson.actions[index].thingsModel.properties[i].datatype.params = formJson.actions[index].thingsModel.properties[i].datatype.params.filter(
                                      (item) => item.isMonitor == 0 && item.isReadonly == 0
                                  );
                              }
                          }
                      }
                      if (formJson.actions[index].thingsModel.functions) {
                          formJson.actions[index].thingsModel.functions = formJson.actions[index].thingsModel.functions.filter((item) => item.isReadonly == 0);
                          for (let i = 0; i < formJson.actions[index].thingsModel.functions.length; i++) {
                              if (formJson.actions[index].thingsModel.functions[i].datatype.params) {
                                  formJson.actions[index].thingsModel.functions[i].datatype.params = formJson.actions[index].thingsModel.functions[i].datatype.params.filter(
                                      (item) => item.isMonitor == 0 && item.isReadonly == 0
                                  );
                              }
                          }
                      }
                    
                  });
              }
          };
  
     /**获取选中的产品或设备
           * type 1=设备集合，2=产品
           */
           function   getSelectDevice(data) {
              const type = 1;
              const index = currentIndex.value;
           
              if (currentType.value == null) {
                  return;
              }
              if (currentType.value == 'trigger') {
                  if (type == 1) {
                      formJson.triggers[index].deviceNums = data.deviceNums;
                      formJson.triggers[index].deviceCount = data.deviceNums.length;
                      formJson.triggers[index].productId = data.productId;
                      formJson.triggers[index].productName = data.productName;
                  } else if (type == 2) {
                      formJson.triggers[index].deviceNums = [];
                      formJson.triggers[index].deviceCount = 0;
                      formJson.triggers[index].productId = data.productId;
                      formJson.triggers[index].productName = data.productName;
                  }
  
                  // 获取物模型
                  cacheJsonThingsModel(data.productId).then((response) => {
                      let data = JSON.parse(response.data);
                      formJson.triggers[index].thingsModel = formatArrayIndex(data);
                      // 清楚之前数据
                      formJson.triggers[index].type = 1;
                      formJson.triggers[index].parentId = '';
                      formJson.triggers[index].parentName = '';
                      formJson.triggers[index].parentModel = null;
                      formJson.triggers[index].model = null;
                      formJson.triggers[index].operator = '';
                      formJson.triggers[index].id = '';
                      formJson.triggers[index].name = '';
                      formJson.triggers[index].value = '';
                      formJson.triggers[index].arrayIndex = '';
                      formJson.triggers[index].arrayIndexName = '';
                   
                  });
              } else if (currentType == 'action') {
                  if (type == 1) {
                      formJson.actions[index].deviceNums = data.deviceNums;
                      formJson.actions[index].deviceCount = data.deviceNums.length;
                      formJson.actions[index].productId = data.productId;
                      formJson.actions[index].productName = data.productName;
                  } else if (type == 2) {
                      formJson.actions[index].deviceNums = [];
                      formJson.actions[index].deviceCount = 0;
                      formJson.actions[index].productId = data.productId;
                      formJson.actions[index].productName = data.productName;
                  }
  
                  // 获取物模型
                  cacheJsonThingsModel(data.productId).then((response) => {
                      let data = JSON.parse(response.data);
                      formJson.actions[index].thingsModel = formatArrayIndex(data);
                      // 清楚之前数据
                      formJson.actions[index].type = 1;
                      formJson.actions[index].parentId = '';
                      formJson.actions[index].parentModel = null;
                      formJson.actions[index].parentName = '';
                      formJson.actions[index].model = null;
                      formJson.actions[index].operator = '';
                      formJson.actions[index].id = '';
                      formJson.actions[index].name = '';
                      formJson.actions[index].value = '';
                      formJson.actions[index].arrayIndex = '';
                      formJson.actions[index].arrayIndexName = '';
                      // 过滤监测数据和只读数据
                      if (formJson.actions[index].thingsModel.properties) {
                          formJson.actions[index].thingsModel.properties = formJson.actions[index].thingsModel.properties.filter((item) => item.isMonitor == 0 && item.isReadonly == 0);
                          for (let i = 0; i < formJson.actions[index].thingsModel.properties.length; i++) {
                              if (formJson.actions[index].thingsModel.properties[i].datatype.params) {
                                  formJson.actions[index].thingsModel.properties[i].datatype.params = formJson.actions[index].thingsModel.properties[i].datatype.params.filter(
                                      (item) => item.isMonitor == 0 && item.isReadonly == 0
                                  );
                              }
                          }
                      }
                      if (formJson.actions[index].thingsModel.functions) {
                          formJson.actions[index].thingsModel.functions = formJson.actions[index].thingsModel.functions.filter((item) => item.isReadonly == 0);
                          for (let i = 0; i < formJson.actions[index].thingsModel.functions.length; i++) {
                              if (formJson.actions[index].thingsModel.functions[i].datatype.params) {
                                  formJson.actions[index].thingsModel.functions[i].datatype.params = formJson.actions[index].thingsModel.functions[i].datatype.params.filter(
                                      (item) => item.isMonitor == 0 && item.isReadonly == 0
                                  );
                              }
                          }
                      }
                    
                    
                  });
              }
          };
  
     // 物模型格式化处理
     function   formatArrayIndex(data) {
              let obj = { ...data };
              for (let o in obj) {
                  obj[o] = obj[o].map((item) => {
                      if (item.datatype.type === 'array') {
                          let arrayModel = [];
                          for (let k = 0; k < item.datatype.arrayCount; k++) {
                              let index = k > 9 ? String(k) : '0' + k;
                              if (item.datatype.arrayType === 'object') {
                                  arrayModel.push({
                                      id: index,
                                      name: item.name + ' ' + (k + 1),
                                  });
                              } else {
                                  arrayModel.push({
                                      id: index,
                                      name: item.name + ' ' + (k + 1),
                                  });
                              }
                          }
                          item.datatype.arrayModel = arrayModel;
                      }
                      return item;
                  });
              }
              return obj;
          }
  
  
  
  
      // 触发器类型改变事件
      function handleTriggerTypeChange(source, index) {
              formJson.triggers[index].id = '';
              formJson.triggers[index].name = '';
              formJson.triggers[index].model = null;
              formJson.triggers[index].operator = '';
              formJson.triggers[index].value = '';
              formJson.triggers[index].valueA = '';
              formJson.triggers[index].valueB = '';
              formJson.triggers[index].parentId = '';
              formJson.triggers[index].parentName = '';
              formJson.triggers[index].parentModel = null;
              formJson.triggers[index].arrayIndex = '';
              formJson.triggers[index].arrayIndexName = '';
          }
          // 触发器父级物模型选择
          function   handleTriggerParentModelChange(identifier, index) {
              formJson.triggers[index].operator = '';
              formJson.triggers[index].value = '';
              formJson.triggers[index].valueA = '';
              formJson.triggers[index].valueB = '';
              formJson.triggers[index].arrayIndex = '';
              formJson.triggers[index].arrayIndexName = '';
              formJson.triggers[index].model = null;
  
              let sceneScripts = [];
              if (formJson.triggers[index].type == 1) {
                  // 因子
                  sceneScripts = formJson.triggers[index].thingsModel.properties;
              } else if (formJson.triggers[index].type == 2) {
                  //功能
                  sceneScripts = formJson.triggers[index].thingsModel.functions;
              } else if (formJson.triggers[index].type == 3) {
                  //事件
                  sceneScripts = formJson.triggers[index].thingsModel.events;
              }
              // 物模型赋值
              for (let i = 0; i < sceneScripts.length; i++) {
                  if (sceneScripts[i].id == identifier) {
                      formJson.triggers[index].parentName = sceneScripts[i].name;
                      formJson.triggers[index].parentModel = sceneScripts[i];
                      if (sceneScripts[i].datatype.type === 'object') {
                          // 对象类型
                          formJson.triggers[index].id = '';
                          formJson.triggers[index].name = '';
                      } else if (sceneScripts[i].datatype.type === 'array' && sceneScripts[i].datatype.arrayType === 'object') {
                          // 对象数组类型
                          formJson.triggers[index].id = '';
                          formJson.triggers[index].name = '';
                      } else if (sceneScripts[i].datatype.type === 'array' && sceneScripts[i].datatype.arrayType !== 'object') {
                          // 普通类型，数组类
                          formJson.triggers[index].id = sceneScripts[i].id;
                          formJson.triggers[index].name = sceneScripts[i].name;
                          // 用于减少界面判断
                          formJson.triggers[index].model = {
                              datatype: {
                                  type: formJson.triggers[index].parentModel.datatype.arrayType,
                                  maxLength: -1,
                                  min: -1,
                                  max: -1,
                                  unit: 无单位,
                              },
                          };
                      } else {
                          // 普通类型,不包含数组类型
                          formJson.triggers[index].id = sceneScripts[i].id;
                          formJson.triggers[index].name = sceneScripts[i].name;
                          formJson.triggers[index].model = sceneScripts[i];
                      }
                      break;
                  }
              }
          }
          // 触发器-物模数组索引选择
          function handleTriggerIndexChange(id, index) {
              formJson.triggers[index].arrayIndexName = formJson.triggers[index].parentModel.datatype.arrayModel.find((x) => x.id == id).name;
              formJson.triggers[index].value = '';
              formJson.triggers[index].valueA = '';
              formJson.triggers[index].valueB = '';
              formJson.triggers[index].operator = '';
              // 数组类型保留id和name
              if (formJson.triggers[index].parentModel.datatype.arrayType === 'object') {
                  formJson.triggers[index].id = '';
                  formJson.triggers[index].name = '';
              }
          }
          // 触发器物模选择
          function handleTriggerModelChange(id, index) {
              formJson.triggers[index].operator = '';
              formJson.triggers[index].value = '';
              formJson.triggers[index].valueA = '';
              formJson.triggers[index].valueB = '';
              let model = null;
              if (formJson.triggers[index].parentModel.datatype.type === 'array' || formJson.triggers[index].parentModel.datatype.type === 'object') {
                  model = formJson.triggers[index].parentModel.datatype.params.find((item) => item.id == id);
                  formJson.triggers[index].name = model.name;
                  formJson.triggers[index].model = model;
              }
          }
  
  
  
  
  
  /** 导出按钮操作 */
  function handleExport() {
    proxy.download('scene/scene/export', {
      ...queryParams
    }, `scene_${new Date().getTime()}.xlsx`)
  }
  
  getList()
  </script>
  <style lang="scss" scoped>
  .iot-scene {
      padding: 20px;
  }
  
  .scene-config-dialog {
      .condition-wrap,
      .action-wrap {
          position: relative;
  
          .trigger-type-wrap {
              margin-bottom: 10px;
  
              ::v-deep .el-input__inner {
                  /**border: none;*/
                  box-shadow: none;
              }
          }
  
          .item-wrap {
              margin-bottom: 15px;
              padding: 10px;
              background-color: #d9e5f6;
              border-radius: 5px;
  
              .delete-wrap {
                  position: absolute;
                  right: 10px;
                  top: 0;
              }
          }
      }
  }
  </style>
  